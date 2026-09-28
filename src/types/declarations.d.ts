declare module 'd3' {
  export const select: any;
  export const selectAll: any;
  export const scaleLinear: any;
  export const scaleTime: any;
  export const scaleBand: any;
  export const scaleOrdinal: any;
  export const scaleThreshold: (<Domain = any, Range = any>() => any) & any;
  export const scaleSequential: any;
  export const axisBottom: any;
  export const axisLeft: any;
  export const axisTop: any;
  export const axisRight: any;
  export const line: any;
  export const area: any;
  export const arc: any;
  export const pie: any;
  export const max: any;
  export const min: any;
  export const extent: any;
  export const timeFormat: any;
  export const timeParse: any;
  export type Selection<GElement = any, Datum = any, PElement = any, PDatum = any> = any;
  const d3: any;
  export default d3;
}

declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: any);
    internal: any;
    text(text: string | string[], x: number, y: number, options?: any): any;
    setFontSize(size: number): any;
    setFont(fontName: string, fontStyle?: string): any;
    setTextColor(ch1?: number | string, ch2?: number, ch3?: number): any;
    setDrawColor(ch1?: number | string, ch2?: number, ch3?: number): any;
    setFillColor(ch1?: number | string, ch2?: number, ch3?: number): any;
    line(x1: number, y1: number, x2: number, y2: number): any;
    rect(x: number, y: number, w: number, h: number, style?: string): any;
    roundedRect(x: number, y: number, w: number, h: number, rx: number, ry: number, style?: string): any;
    addPage(format?: string | number[], orientation?: 'p' | 'portrait' | 'l' | 'landscape'): any;
    save(filename?: string): any;
    output(type?: string, options?: any): any;
    splitTextToSize(text: string, maxW: number): string[];
    getNumberOfPages(): number;
    setPage(pageNumber: number): any;
  }
  export default jsPDF;
}
