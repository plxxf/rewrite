/**
 * Get file extension for a given format
 */
export function getFileExtension(format: string): string {
  const extensionMap: Record<string, string> = {
    markdown: "md",
    html: "html",
    docx: "docx",
    pdf: "pdf",
    latex: "tex",
    rst: "rst",
    textile: "textile",
    asciidoc: "adoc",
    org: "org",
    mediawiki: "wiki",
    epub: "epub",
    odt: "odt",
    rtf: "rtf",
    plain: "txt",
    json: "json",
    ipynb: "ipynb",
    pptx: "pptx",
  };

  return extensionMap[format] || "txt";
}
