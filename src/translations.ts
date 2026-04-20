export type CompressionLevel = "max" | "high" | "medium" | "low";
export type ThemeMode = "system" | "light" | "dark";
export type Locale = "pt-BR" | "en" | "es" | "fr" | "de" | "it";

export type LocaleOption = {
  value: Locale;
  label: string;
};

export type Translation = {
  appName: string;
  tagline: string;
  title: string;
  intro: string;
  selectedFiles: string;
  outputFolder: string;
  noFiles: string;
  noFolder: string;
  choosePdfs: string;
  chooseFolder: string;
  clearFiles: string;
  openFolder: string;
  about: string;
  aboutTitle: string;
  aboutSummary: string;
  aboutDetails: string;
  aboutLinks: string;
  aboutDependencies: string;
  createdBy: string;
  donation: string;
  website: string;
  version: string;
  license: string;
  ghostscriptVersion: string;
  aboutUnavailable: string;
  close: string;
  compressionLevel: string;
  compress: string;
  compressing: string;
  cancel: string;
  cancelled: string;
  settings: string;
  appearance: string;
  language: string;
  system: string;
  light: string;
  dark: string;
  ready: string;
  chooseFilesFirst: string;
  chooseFolderFirst: string;
  filesSelected: string;
  folderSelected: string;
  progressLabel: string;
  progressIdle: string;
  finished: string;
  summary: string;
  processed: string;
  originalTotal: string;
  finalTotal: string;
  reduction: string;
  savedIn: string;
  currentFile: string;
  failedItem: string;
  failedBatch: string;
  failedFiles: string;
  partialFinished: string;
  ghostscriptMissing: string;
  selectedCount: (count: number) => string;
  levelOptions: Record<CompressionLevel, { label: string; description: string }>;
  errors: Record<string, string>;
};

export const translations: Record<Locale, Translation> = {
  "pt-BR": {
    appName: "OzemPDF",
    tagline: "Compactador de PDF",
    title: "OzemPDF",
    intro: "Escolha um ou vários PDFs, defina a pasta de saída e compacte sem complicação.",
    selectedFiles: "PDFs selecionados",
    outputFolder: "Pasta de saída",
    noFiles: "Nenhum PDF selecionado",
    noFolder: "Nenhuma pasta definida",
    choosePdfs: "Escolher PDFs",
    chooseFolder: "Escolher pasta",
    clearFiles: "Limpar",
    openFolder: "Abrir pasta de saída",
    about: "Sobre",
    aboutTitle: "Sobre o OzemPDF",
    aboutSummary: "Resumo",
    aboutDetails: "Detalhes",
    aboutLinks: "Links oficiais",
    aboutDependencies: "Dependências",
    createdBy: "Criado por",
    donation: "Doação",
    website: "Site do projeto",
    version: "Versão",
    license: "Licença",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "Indisponível",
    close: "Fechar",
    compressionLevel: "Nível de compactação",
    compress: "Compactar PDFs",
    compressing: "Compactando...",
    cancel: "Cancelar",
    cancelled: "Compactação cancelada pelo usuário.",
    settings: "Configurações",
    appearance: "Aparência",
    language: "Idioma",
    system: "Padrão do sistema",
    light: "Claro",
    dark: "Escuro",
    ready: "Selecione os PDFs para começar.",
    chooseFilesFirst: "Selecione pelo menos um PDF.",
    chooseFolderFirst: "Escolha a pasta de saída.",
    filesSelected: "PDFs selecionados. Agora escolha a pasta de saída.",
    folderSelected: "Pasta de saída definida.",
    progressLabel: "Progresso",
    progressIdle: "Aguardando início.",
    finished: "Compactação concluída com sucesso.",
    summary: "Resumo",
    processed: "Arquivos processados",
    originalTotal: "Tamanho original",
    finalTotal: "Tamanho final",
    reduction: "Redução",
    savedIn: "Salvo em",
    currentFile: "Arquivo atual",
    failedItem: "Falha ao compactar",
    failedBatch: "Falha durante a compactação.",
    failedFiles: "Arquivos com falha",
    partialFinished: "Compactação concluída com falhas parciais.",
    ghostscriptMissing: "Ghostscript não está disponível. Instale o comando gs para compactar PDFs.",
    selectedCount: (count) => `${count} arquivo${count === 1 ? "" : "s"} selecionado${count === 1 ? "" : "s"}`,
    levelOptions: {
      max: {
        label: "Máxima",
        description: "Menor arquivo possível."
      },
      high: {
        label: "Alta",
        description: "Boa redução para uso geral."
      },
      medium: {
        label: "Equilibrada",
        description: "Mais fidelidade com boa compactação."
      },
      low: {
        label: "Qualidade",
        description: "Compressão leve."
      }
    },
    errors: {
      "error.input_not_found": "O arquivo de entrada não existe.",
      "error.input_not_file": "O caminho de entrada precisa ser um arquivo PDF.",
      "error.input_not_pdf": "Selecione um arquivo com extensão .pdf.",
      "error.same_input_output": "Escolha um arquivo de saída diferente do original.",
      "error.output_not_pdf": "O arquivo de saída precisa terminar com .pdf.",
      "error.invalid_output_path": "O caminho de saída é inválido.",
      "error.invalid_output_name": "O nome do arquivo de saída é inválido.",
      "error.create_output_dir_failed": "Não foi possível preparar a pasta de saída.",
      "error.gs_unavailable": "Ghostscript indisponível.",
      "error.gs_execution_failed": "Falha ao executar Ghostscript.",
      "error.gs_compress_failed": "Não foi possível comprimir o PDF.",
      "error.no_free_output_name": "Não foi possível reservar um nome livre para o arquivo de saída.",
      "error.read_file_size_failed": "Não foi possível ler o tamanho do arquivo.",
      "error.invalid_external_link": "O link externo precisa usar http:// ou https://.",
      "error.open_link_failed": "Não foi possível abrir o link externo."
    }
  },
  en: {
    appName: "OzemPDF",
    tagline: "PDF compressor",
    title: "OzemPDF",
    intro: "Pick one or more PDFs, choose the output folder, and compress with minimal friction.",
    selectedFiles: "Selected PDFs",
    outputFolder: "Output folder",
    noFiles: "No PDF selected",
    noFolder: "No folder selected",
    choosePdfs: "Choose PDFs",
    chooseFolder: "Choose folder",
    clearFiles: "Clear",
    openFolder: "Open output folder",
    about: "About",
    aboutTitle: "About OzemPDF",
    aboutSummary: "Summary",
    aboutDetails: "Details",
    aboutLinks: "Official links",
    aboutDependencies: "Dependencies",
    createdBy: "Created by",
    donation: "Donation",
    website: "Project site",
    version: "Version",
    license: "License",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "Unavailable",
    close: "Close",
    compressionLevel: "Compression level",
    compress: "Compress PDFs",
    compressing: "Compressing...",
    cancel: "Cancel",
    cancelled: "Compression cancelled by user.",
    settings: "Settings",
    appearance: "Appearance",
    language: "Language",
    system: "System",
    light: "Light",
    dark: "Dark",
    ready: "Select PDFs to begin.",
    chooseFilesFirst: "Select at least one PDF.",
    chooseFolderFirst: "Choose an output folder.",
    filesSelected: "PDFs selected. Now choose the output folder.",
    folderSelected: "Output folder selected.",
    progressLabel: "Progress",
    progressIdle: "Waiting to start.",
    finished: "Compression finished successfully.",
    summary: "Summary",
    processed: "Processed files",
    originalTotal: "Original size",
    finalTotal: "Final size",
    reduction: "Reduction",
    savedIn: "Saved in",
    currentFile: "Current file",
    failedItem: "Failed to compress",
    failedBatch: "Compression failed.",
    failedFiles: "Failed files",
    partialFinished: "Compression finished with partial failures.",
    ghostscriptMissing: "Ghostscript is not available. Install the gs command to compress PDFs.",
    selectedCount: (count) => `${count} file${count === 1 ? "" : "s"} selected`,
    levelOptions: {
      max: {
        label: "Maximum",
        description: "Smallest file size."
      },
      high: {
        label: "High",
        description: "Good reduction for general use."
      },
      medium: {
        label: "Balanced",
        description: "More fidelity with solid compression."
      },
      low: {
        label: "Quality",
        description: "Light compression."
      }
    },
    errors: {
      "error.input_not_found": "The input file does not exist.",
      "error.input_not_file": "The input path must be a PDF file.",
      "error.input_not_pdf": "Please select a file with .pdf extension.",
      "error.same_input_output": "Choose an output file different from the original.",
      "error.output_not_pdf": "The output file must end with .pdf.",
      "error.invalid_output_path": "The output path is invalid.",
      "error.invalid_output_name": "The output file name is invalid.",
      "error.create_output_dir_failed": "Could not create the output folder.",
      "error.gs_unavailable": "Ghostscript is unavailable.",
      "error.gs_execution_failed": "Failed to execute Ghostscript.",
      "error.gs_compress_failed": "Could not compress the PDF.",
      "error.no_free_output_name": "Could not find a free name for the output file.",
      "error.read_file_size_failed": "Could not read the file size.",
      "error.invalid_external_link": "External links must use http:// or https://.",
      "error.open_link_failed": "Could not open the external link."
    }
  },
  es: {
    appName: "OzemPDF",
    tagline: "Compresor de PDF",
    title: "OzemPDF",
    intro: "Elige uno o varios PDF, define la carpeta de salida y comprime sin complicaciones.",
    selectedFiles: "PDF seleccionados",
    outputFolder: "Carpeta de salida",
    noFiles: "Ningún PDF seleccionado",
    noFolder: "Ninguna carpeta definida",
    choosePdfs: "Elegir PDF",
    chooseFolder: "Elegir carpeta",
    clearFiles: "Limpiar",
    openFolder: "Abrir carpeta de salida",
    about: "Acerca de",
    aboutTitle: "Acerca de OzemPDF",
    aboutSummary: "Resumen",
    aboutDetails: "Detalles",
    aboutLinks: "Enlaces oficiales",
    aboutDependencies: "Dependencias",
    createdBy: "Creado por",
    donation: "Donación",
    website: "Sitio del proyecto",
    version: "Versión",
    license: "Licencia",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "No disponible",
    close: "Cerrar",
    compressionLevel: "Nivel de compresión",
    compress: "Comprimir PDF",
    compressing: "Comprimiendo...",
    cancel: "Cancelar",
    cancelled: "Compresión cancelada por el usuario.",
    settings: "Configuración",
    appearance: "Apariencia",
    language: "Idioma",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
    ready: "Selecciona los PDF para comenzar.",
    chooseFilesFirst: "Selecciona al menos un PDF.",
    chooseFolderFirst: "Elige la carpeta de salida.",
    filesSelected: "PDF seleccionados. Ahora elige la carpeta de salida.",
    folderSelected: "Carpeta de salida definida.",
    progressLabel: "Progreso",
    progressIdle: "Esperando para empezar.",
    finished: "Compresión finalizada correctamente.",
    summary: "Resumen",
    processed: "Archivos procesados",
    originalTotal: "Tamaño original",
    finalTotal: "Tamaño final",
    reduction: "Reducción",
    savedIn: "Guardado en",
    currentFile: "Archivo actual",
    failedItem: "Error al comprimir",
    failedBatch: "La compresión falló.",
    failedFiles: "Archivos con error",
    partialFinished: "La compresión terminó con fallos parciales.",
    ghostscriptMissing: "Ghostscript no está disponible. Instala el comando gs para comprimir PDF.",
    selectedCount: (count) => `${count} archivo${count === 1 ? "" : "s"} seleccionado${count === 1 ? "" : "s"}`,
    levelOptions: {
      max: {
        label: "Máxima",
        description: "Menor tamaño posible."
      },
      high: {
        label: "Alta",
        description: "Buena reducción para uso general."
      },
      medium: {
        label: "Equilibrada",
        description: "Más fidelidad con buena compresión."
      },
      low: {
        label: "Calidad",
        description: "Compresión ligera."
      }
    },
    errors: {
      "error.input_not_found": "El archivo de entrada no existe.",
      "error.input_not_file": "La ruta de entrada debe ser un archivo PDF.",
      "error.input_not_pdf": "Seleccione un archivo con extensión .pdf.",
      "error.same_input_output": "Elija un archivo de salida diferente al original.",
      "error.output_not_pdf": "El archivo de salida debe terminar con .pdf.",
      "error.invalid_output_path": "La ruta de salida es inválida.",
      "error.invalid_output_name": "El nombre del archivo de salida es inválido.",
      "error.create_output_dir_failed": "No se pudo crear la carpeta de salida.",
      "error.gs_unavailable": "Ghostscript no está disponible.",
      "error.gs_execution_failed": "Error al ejecutar Ghostscript.",
      "error.gs_compress_failed": "No se pudo comprimir el PDF.",
      "error.no_free_output_name": "No se pudo encontrar un nombre libre para el archivo de salida.",
      "error.read_file_size_failed": "No se pudo leer el tamaño del archivo.",
      "error.invalid_external_link": "Los enlaces externos deben usar http:// o https://.",
      "error.open_link_failed": "No se pudo abrir el enlace externo."
    }
  },
  fr: {
    appName: "OzemPDF",
    tagline: "Compresseur PDF",
    title: "OzemPDF",
    intro: "Choisissez un ou plusieurs PDF, définissez le dossier de sortie et compressez simplement.",
    selectedFiles: "PDF sélectionnés",
    outputFolder: "Dossier de sortie",
    noFiles: "Aucun PDF sélectionné",
    noFolder: "Aucun dossier défini",
    choosePdfs: "Choisir des PDF",
    chooseFolder: "Choisir le dossier",
    clearFiles: "Vider",
    openFolder: "Ouvrir le dossier de sortie",
    about: "À propos",
    aboutTitle: "À propos d'OzemPDF",
    aboutSummary: "Résumé",
    aboutDetails: "Détails",
    aboutLinks: "Liens officiels",
    aboutDependencies: "Dépendances",
    createdBy: "Créé par",
    donation: "Don",
    website: "Site du projet",
    version: "Version",
    license: "Licence",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "Indisponible",
    close: "Fermer",
    compressionLevel: "Niveau de compression",
    compress: "Compresser les PDF",
    compressing: "Compression...",
    cancel: "Annuler",
    cancelled: "Compression annulée par l'utilisateur.",
    settings: "Paramètres",
    appearance: "Apparence",
    language: "Langue",
    system: "Système",
    light: "Clair",
    dark: "Sombre",
    ready: "Sélectionnez les PDF pour commencer.",
    chooseFilesFirst: "Sélectionnez au moins un PDF.",
    chooseFolderFirst: "Choisissez le dossier de sortie.",
    filesSelected: "PDF sélectionnés. Choisissez maintenant le dossier de sortie.",
    folderSelected: "Dossier de sortie défini.",
    progressLabel: "Progression",
    progressIdle: "En attente de démarrage.",
    finished: "Compression terminée avec succès.",
    summary: "Résumé",
    processed: "Fichiers traités",
    originalTotal: "Taille d'origine",
    finalTotal: "Taille finale",
    reduction: "Réduction",
    savedIn: "Enregistré dans",
    currentFile: "Fichier actuel",
    failedItem: "Échec de compression",
    failedBatch: "La compression a échoué.",
    failedFiles: "Fichiers en échec",
    partialFinished: "Compression terminée avec des échecs partiels.",
    ghostscriptMissing: "Ghostscript est indisponible. Installez la commande gs pour compresser les PDF.",
    selectedCount: (count) => `${count} fichier${count === 1 ? "" : "s"} sélectionné${count === 1 ? "" : "s"}`,
    levelOptions: {
      max: {
        label: "Maximale",
        description: "Taille la plus petite possible."
      },
      high: {
        label: "Élevée",
        description: "Bonne réduction pour un usage général."
      },
      medium: {
        label: "Équilibrée",
        description: "Plus de fidélité avec une bonne compression."
      },
      low: {
        label: "Qualité",
        description: "Compression légère."
      }
    },
    errors: {
      "error.input_not_found": "Le fichier d'entrée n'existe pas.",
      "error.input_not_file": "Le chemin d'entrée doit être un fichier PDF.",
      "error.input_not_pdf": "Sélectionnez un fichier avec l'extension .pdf.",
      "error.same_input_output": "Choisissez un fichier de sortie différent de l'original.",
      "error.output_not_pdf": "Le fichier de sortie doit se terminer par .pdf.",
      "error.invalid_output_path": "Le chemin de sortie est invalide.",
      "error.invalid_output_name": "Le nom du fichier de sortie est invalide.",
      "error.create_output_dir_failed": "Impossible de créer le dossier de sortie.",
      "error.gs_unavailable": "Ghostscript est indisponible.",
      "error.gs_execution_failed": "Échec de l'exécution de Ghostscript.",
      "error.gs_compress_failed": "Impossible de compresser le PDF.",
      "error.no_free_output_name": "Impossible de trouver un nom libre pour le fichier de sortie.",
      "error.read_file_size_failed": "Impossible de lire la taille du fichier.",
      "error.invalid_external_link": "Les liens externes doivent utiliser http:// ou https://.",
      "error.open_link_failed": "Impossible d'ouvrir le lien externe."
    }
  },
  de: {
    appName: "OzemPDF",
    tagline: "PDF-Kompressor",
    title: "OzemPDF",
    intro: "Wählen Sie ein oder mehrere PDFs, legen Sie den Ausgabeordner fest und komprimieren Sie ohne Umwege.",
    selectedFiles: "Ausgewählte PDFs",
    outputFolder: "Ausgabeordner",
    noFiles: "Kein PDF ausgewählt",
    noFolder: "Kein Ordner ausgewählt",
    choosePdfs: "PDFs wählen",
    chooseFolder: "Ordner wählen",
    clearFiles: "Leeren",
    openFolder: "Ausgabeordner öffnen",
    about: "Über",
    aboutTitle: "Über OzemPDF",
    aboutSummary: "Zusammenfassung",
    aboutDetails: "Details",
    aboutLinks: "Offizielle Links",
    aboutDependencies: "Abhängigkeiten",
    createdBy: "Erstellt von",
    donation: "Spende",
    website: "Projektseite",
    version: "Version",
    license: "Lizenz",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "Nicht verfügbar",
    close: "Schließen",
    compressionLevel: "Komprimierungsstufe",
    compress: "PDFs komprimieren",
    compressing: "Komprimierung läuft...",
    cancel: "Abbrechen",
    cancelled: "Komprimierung vom Benutzer abgebrochen.",
    settings: "Einstellungen",
    appearance: "Darstellung",
    language: "Sprache",
    system: "System",
    light: "Hell",
    dark: "Dunkel",
    ready: "Wählen Sie PDFs aus, um zu beginnen.",
    chooseFilesFirst: "Wählen Sie mindestens ein PDF aus.",
    chooseFolderFirst: "Wählen Sie einen Ausgabeordner.",
    filesSelected: "PDFs ausgewählt. Wählen Sie jetzt den Ausgabeordner.",
    folderSelected: "Ausgabeordner festgelegt.",
    progressLabel: "Fortschritt",
    progressIdle: "Wartet auf Start.",
    finished: "Komprimierung erfolgreich abgeschlossen.",
    summary: "Zusammenfassung",
    processed: "Verarbeitete Dateien",
    originalTotal: "Originalgröße",
    finalTotal: "Endgröße",
    reduction: "Reduktion",
    savedIn: "Gespeichert in",
    currentFile: "Aktuelle Datei",
    failedItem: "Komprimierung fehlgeschlagen",
    failedBatch: "Komprimierung fehlgeschlagen.",
    failedFiles: "Fehlgeschlagene Dateien",
    partialFinished: "Komprimierung mit teilweisen Fehlern abgeschlossen.",
    ghostscriptMissing: "Ghostscript ist nicht verfügbar. Installieren Sie den Befehl gs, um PDFs zu komprimieren.",
    selectedCount: (count) => `${count} Datei${count === 1 ? "" : "en"} ausgewählt`,
    levelOptions: {
      max: {
        label: "Maximal",
        description: "Kleinste Dateigröße."
      },
      high: {
        label: "Hoch",
        description: "Gute Reduktion für den Alltag."
      },
      medium: {
        label: "Ausgewogen",
        description: "Mehr Treue bei guter Komprimierung."
      },
      low: {
        label: "Qualität",
        description: "Leichte Komprimierung."
      }
    },
    errors: {
      "error.input_not_found": "Die Eingabedatei existiert nicht.",
      "error.input_not_file": "Der Eingabepfad muss eine PDF-Datei sein.",
      "error.input_not_pdf": "Bitte wählen Sie eine Datei mit der Endung .pdf.",
      "error.same_input_output": "Wählen Sie eine andere Ausgabedatei als das Original.",
      "error.output_not_pdf": "Die Ausgabedatei muss mit .pdf enden.",
      "error.invalid_output_path": "Der Ausgabepfad ist ungültig.",
      "error.invalid_output_name": "Der Name der Ausgabedatei ist ungültig.",
      "error.create_output_dir_failed": "Der Ausgabeordner konnte nicht erstellt werden.",
      "error.gs_unavailable": "Ghostscript ist nicht verfügbar.",
      "error.gs_execution_failed": "Ghostscript konnte nicht ausgeführt werden.",
      "error.gs_compress_failed": "Das PDF konnte nicht komprimiert werden.",
      "error.no_free_output_name": "Es konnte kein freier Name für die Ausgabedatei gefunden werden.",
      "error.read_file_size_failed": "Die Dateigröße konnte nicht gelesen werden.",
      "error.invalid_external_link": "Externe Links müssen http:// oder https:// verwenden.",
      "error.open_link_failed": "Der externe Link konnte nicht geöffnet werden."
    }
  },
  it: {
    appName: "OzemPDF",
    tagline: "Compressore PDF",
    title: "OzemPDF",
    intro: "Scegli uno o più PDF, imposta la cartella di output e comprimi in modo semplice.",
    selectedFiles: "PDF selezionati",
    outputFolder: "Cartella di output",
    noFiles: "Nessun PDF selezionado",
    noFolder: "Nessuna cartella definita",
    choosePdfs: "Scegli PDF",
    chooseFolder: "Scegli cartella",
    clearFiles: "Pulisci",
    openFolder: "Apri cartella di output",
    about: "Informazioni",
    aboutTitle: "Informazioni su OzemPDF",
    aboutSummary: "Riepilogo",
    aboutDetails: "Dettagli",
    aboutLinks: "Link ufficiali",
    aboutDependencies: "Dipendenze",
    createdBy: "Creato da",
    donation: "Donazione",
    website: "Sito del progetto",
    version: "Versione",
    license: "Licenza",
    ghostscriptVersion: "Ghostscript",
    aboutUnavailable: "Non disponibile",
    close: "Chiudi",
    compressionLevel: "Livello di compressione",
    compress: "Comprimi PDF",
    compressing: "Compressione in corso...",
    cancel: "Annulla",
    cancelled: "Compressione annullata dall'utente.",
    settings: "Impostazioni",
    appearance: "Aspetto",
    language: "Lingua",
    system: "Sistema",
    light: "Chiaro",
    dark: "Scuro",
    ready: "Seleziona i PDF per iniziare.",
    chooseFilesFirst: "Seleziona almeno un PDF.",
    chooseFolderFirst: "Scegli la cartella di output.",
    filesSelected: "PDF selezionati. Ora scegli la cartella di output.",
    folderSelected: "Cartella di output definita.",
    progressLabel: "Avanzamento",
    progressIdle: "In attesa di iniziare.",
    finished: "Compressione completata con successo.",
    summary: "Riepilogo",
    processed: "File elaborati",
    originalTotal: "Dimensione originale",
    finalTotal: "Dimensione finale",
    reduction: "Riduzione",
    savedIn: "Salvato in",
    currentFile: "File corrente",
    failedItem: "Compressione non riuscita",
    failedBatch: "La compressione non è riuscita.",
    failedFiles: "File non riusciti",
    partialFinished: "Compressione completata con errori parziali.",
    ghostscriptMissing: "Ghostscript non è disponível. Installa il comando gs per comprimere i PDF.",
    selectedCount: (count) => `${count} file selezionat${count === 1 ? "o" : "i"}`,
    levelOptions: {
      max: {
        label: "Massima",
        description: "Dimensione più piccola possibile."
      },
      high: {
        label: "Alta",
        description: "Buona riduzione per uso generale."
      },
      medium: {
        label: "Bilanciata",
        description: "Più fedeltà con buona compressione."
      },
      low: {
        label: "Qualità",
        description: "Compressione leggera."
      }
    },
    errors: {
      "error.input_not_found": "Il file di input non esiste.",
      "error.input_not_file": "Il percorso di input deve essere un file PDF.",
      "error.input_not_pdf": "Seleziona un file con estensione .pdf.",
      "error.same_input_output": "Scegli un file di output diverso dall'originale.",
      "error.output_not_pdf": "Il file di output deve terminare con .pdf.",
      "error.invalid_output_path": "Il percorso di output non è valido.",
      "error.invalid_output_name": "Il nome del file di output non è valido.",
      "error.create_output_dir_failed": "Impossibile creare la cartella di output.",
      "error.gs_unavailable": "Ghostscript non è disponibile.",
      "error.gs_execution_failed": "Esecuzione di Ghostscript non riuscita.",
      "error.gs_compress_failed": "Impossibile comprimere il PDF.",
      "error.no_free_output_name": "Impossibile trovare un nome libero per il file di output.",
      "error.read_file_size_failed": "Impossibile leggere la dimensione del file.",
      "error.invalid_external_link": "I link esterni devono usare http:// o https://.",
      "error.open_link_failed": "Impossibile aprire il link esterno."
    }
  }
};
