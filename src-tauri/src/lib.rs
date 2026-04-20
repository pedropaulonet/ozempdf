use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CompressionRequest {
    input_path: String,
    output_path: String,
    level: CompressionLevel,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "lowercase")]
enum CompressionLevel {
    Max,
    High,
    Medium,
    Low,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CompressionResponse {
    input_path: String,
    output_path: String,
    original_size_bytes: u64,
    compressed_size_bytes: u64,
    reduction_percent: f64,
    preset: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemStatus {
    ghostscript_available: bool,
    ghostscript_version: Option<String>,
    ghostscript_error: Option<String>,
}

#[tauri::command]
fn open_external_link(url: String) -> Result<(), String> {
    let is_web = url.starts_with("https://") || url.starts_with("http://");
    let is_path = std::path::Path::new(&url).exists();

    if !is_web && !is_path {
        return Err("error.invalid_external_link".to_string());
    }

    open::that(&url).map_err(|_| "error.open_link_failed".to_string())?;

    Ok(())
}

#[tauri::command]
fn get_system_status() -> SystemStatus {
    match detect_ghostscript() {
        Ok(version) => SystemStatus {
            ghostscript_available: true,
            ghostscript_version: Some(version),
            ghostscript_error: None,
        },
        Err(error) => SystemStatus {
            ghostscript_available: false,
            ghostscript_version: None,
            ghostscript_error: Some(error),
        },
    }
}

#[tauri::command]
fn compress_pdf(request: CompressionRequest) -> Result<CompressionResponse, String> {
    let input = PathBuf::from(&request.input_path);
    let requested_output = PathBuf::from(&request.output_path);

    validate_paths(&input, &requested_output)?;
    ensure_ghostscript()?;

    let output = resolve_output_path(&requested_output)?;

    let original_size = file_size(&input)?;
    let preset = request.level.gs_setting();
    let parent = output
        .parent()
        .ok_or_else(|| "error.invalid_output_path".to_string())?;

    fs::create_dir_all(parent).map_err(|_| "error.create_output_dir_failed".to_string())?;

    let gs_output = Command::new("gs")
        .arg("-sDEVICE=pdfwrite")
        .arg("-dCompatibilityLevel=1.4")
        .arg("-dNOPAUSE")
        .arg("-dQUIET")
        .arg("-dBATCH")
        .arg(format!("-dPDFSETTINGS={preset}"))
        .arg("-dDetectDuplicateImages=true")
        .arg("-dCompressFonts=true")
        .arg("-dDownsampleColorImages=true")
        .arg("-dDownsampleGrayImages=true")
        .arg("-dDownsampleMonoImages=true")
        .arg(format!("-sOutputFile={}", output.display()))
        .arg(input.as_os_str())
        .output()
        .map_err(|_| "error.gs_execution_failed".to_string())?;

    if !gs_output.status.success() {
        let stderr = String::from_utf8_lossy(&gs_output.stderr);
        let stdout = String::from_utf8_lossy(&gs_output.stdout);
        let details = if !stderr.trim().is_empty() {
            stderr.trim().to_string()
        } else if !stdout.trim().is_empty() {
            stdout.trim().to_string()
        } else {
            String::new()
        };

        return if details.is_empty() {
            Err("error.gs_compress_failed".to_string())
        } else {
            Err(format!("error.gs_compress_failed|{details}"))
        };
    }

    let compressed_size = file_size(&output)?;
    let reduction_percent = if original_size == 0 {
        0.0
    } else {
        (1.0 - (compressed_size as f64 / original_size as f64)) * 100.0
    };

    Ok(CompressionResponse {
        input_path: request.input_path,
        output_path: output.display().to_string(),
        original_size_bytes: original_size,
        compressed_size_bytes: compressed_size,
        reduction_percent,
        preset: preset.to_string(),
    })
}

fn validate_paths(input: &Path, output: &Path) -> Result<(), String> {
    if !input.exists() {
        return Err("error.input_not_found".to_string());
    }

    if !input.is_file() {
        return Err("error.input_not_file".to_string());
    }

    let input_extension_is_pdf = input
        .extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| ext.eq_ignore_ascii_case("pdf"));

    if !input_extension_is_pdf {
        return Err("error.input_not_pdf".to_string());
    }

    if input == output {
        return Err("error.same_input_output".to_string());
    }

    let output_extension_is_pdf = output
        .extension()
        .and_then(|ext| ext.to_str())
        .is_some_and(|ext| ext.eq_ignore_ascii_case("pdf"));

    if !output_extension_is_pdf {
        return Err("error.output_not_pdf".to_string());
    }

    Ok(())
}

fn detect_ghostscript() -> Result<String, String> {
    let output = Command::new("gs")
        .arg("--version")
        .output()
        .map_err(|_| "error.gs_unavailable".to_string())?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        let details = if !stderr.trim().is_empty() {
            stderr.trim().to_string()
        } else if !stdout.trim().is_empty() {
            stdout.trim().to_string()
        } else {
            String::new()
        };

        return if details.is_empty() {
            Err("error.gs_unavailable".to_string())
        } else {
            Err(format!("error.gs_unavailable|{details}"))
        };
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

fn ensure_ghostscript() -> Result<(), String> {
    detect_ghostscript().map(|_| ())
}

fn resolve_output_path(requested_output: &Path) -> Result<PathBuf, String> {
    if !requested_output.exists() {
        return Ok(requested_output.to_path_buf());
    }

    let parent = requested_output
        .parent()
        .ok_or_else(|| "error.invalid_output_path".to_string())?;
    let stem = requested_output
        .file_stem()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "error.invalid_output_name".to_string())?;
    let extension = requested_output
        .extension()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "error.output_not_pdf".to_string())?;

    for index in 2..=10_000 {
        let candidate = parent.join(format!("{stem}-{index}.{extension}"));
        if !candidate.exists() {
            return Ok(candidate);
        }
    }

    Err("error.no_free_output_name".to_string())
}

fn file_size(path: &Path) -> Result<u64, String> {
    fs::metadata(path)
        .map(|metadata| metadata.len())
        .map_err(|_| "error.read_file_size_failed".to_string())
}

impl CompressionLevel {
    fn gs_setting(&self) -> &'static str {
        match self {
            Self::Max => "/screen",
            Self::High => "/ebook",
            Self::Medium => "/printer",
            Self::Low => "/prepress",
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            compress_pdf,
            get_system_status,
            open_external_link
        ])
        .run(tauri::generate_context!())
        .expect("failed to run tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compression_level_mapping() {
        assert_eq!(CompressionLevel::Max.gs_setting(), "/screen");
        assert_eq!(CompressionLevel::High.gs_setting(), "/ebook");
        assert_eq!(CompressionLevel::Medium.gs_setting(), "/printer");
        assert_eq!(CompressionLevel::Low.gs_setting(), "/prepress");
    }

    #[test]
    fn test_resolve_output_path_basic() {
        let path = Path::new("non_existing.pdf");
        let resolved = resolve_output_path(path).unwrap();
        assert_eq!(resolved.to_str().unwrap(), "non_existing.pdf");
    }

    #[test]
    fn test_resolve_output_path_collision() {
        let base = "test_collision.pdf";
        let expected = "test_collision-2.pdf";

        fs::write(base, "").unwrap();
        let resolved = resolve_output_path(Path::new(base)).unwrap();
        fs::remove_file(base).unwrap();

        assert_eq!(resolved.to_str().unwrap(), expected);
    }

    #[test]
    fn test_validate_paths_success() {
        let input = "input_success.pdf";
        let output = "output_success.pdf";
        fs::write(input, "").unwrap();

        let result = validate_paths(Path::new(input), Path::new(output));
        fs::remove_file(input).unwrap();

        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_paths_input_not_found() {
        let result = validate_paths(Path::new("missing_val.pdf"), Path::new("out_val.pdf"));
        assert_eq!(result.unwrap_err(), "error.input_not_found");
    }

    #[test]
    fn test_validate_paths_input_not_pdf() {
        let input = "input_not_pdf.txt";
        fs::write(input, "").unwrap();
        let result = validate_paths(Path::new(input), Path::new("out_not_pdf.pdf"));
        fs::remove_file(input).unwrap();
        assert_eq!(result.unwrap_err(), "error.input_not_pdf");
    }

    #[test]
    fn test_validate_paths_input_is_dir() {
        let dir = "test_dir_val";
        fs::create_dir(dir).unwrap();
        let result = validate_paths(Path::new(dir), Path::new("out_dir.pdf"));
        fs::remove_dir(dir).unwrap();
        assert_eq!(result.unwrap_err(), "error.input_not_file");
    }

    #[test]
    fn test_validate_paths_same_path() {
        let input = "input_same.pdf";
        fs::write(input, "").unwrap();
        let result = validate_paths(Path::new(input), Path::new(input));
        fs::remove_file(input).unwrap();
        assert_eq!(result.unwrap_err(), "error.same_input_output");
    }

    #[test]
    fn test_validate_paths_output_not_pdf() {
        let input = "input_out_ext.pdf";
        fs::write(input, "").unwrap();
        let result = validate_paths(Path::new(input), Path::new("out_ext.txt"));
        fs::remove_file(input).unwrap();
        assert_eq!(result.unwrap_err(), "error.output_not_pdf");
    }

    #[test]
    fn test_file_size() {
        let path = "test_size.txt";
        let data = "hello";
        fs::write(path, data).unwrap();
        let size = file_size(Path::new(path)).unwrap();
        fs::remove_file(path).unwrap();
        assert_eq!(size, data.len() as u64);
    }

    #[test]
    fn test_detect_ghostscript_success() {
        let expected = match Command::new("gs").arg("--version").output() {
            Ok(output) => output,
            Err(_) => {
                eprintln!("skipping: gs not available on this system");
                return;
            }
        };

        assert!(expected.status.success());

        let result = detect_ghostscript();

        assert!(result.is_ok());
        assert_eq!(
            result.unwrap(),
            String::from_utf8_lossy(&expected.stdout).trim()
        );
    }
}
