declare module 'xlsx' {
  export interface WorkSheet {
    [key: string]: any;
  }

  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export const utils: {
    json_to_sheet: (data: any[]) => WorkSheet;
    sheet_to_csv: (worksheet: WorkSheet) => string;
    book_new: () => WorkBook;
    book_append_sheet: (workbook: WorkBook, worksheet: WorkSheet, name: string) => void;
  };

  export function writeFile(workbook: WorkBook, filename: string): void;
}
