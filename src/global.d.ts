interface ICreateTxtFileData {
  fileName: string,
  fileContent: string
}
interface Window {
  electronAPI: {
    createTxtFile: (data: ICreateTxtFileData ) => Promise<{
      success: boolean;
      error: string
    }>,
  };
}