declare module 'formidable' {
  export interface File {
    filepath: string
    originalFilename: string
    mimetype: string
    size: number
  }

  export type Fields = { [key: string]: string | string[] }
  export type Files = { [key: string]: File | File[] }

  export interface FormidableOptions {
    uploadDir?: string
    keepExtensions?: boolean
    maxFileSize?: number
    filename?: (name: string, ext: string, part: any) => string
  }

  export default function formidable(
    options?: FormidableOptions
  ): {
    parse(req: any, callback: (err: any, fields: Fields, files: Files) => void): void
  }
}
