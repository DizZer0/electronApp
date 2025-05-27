import { contextBridge, ipcRenderer } from "electron";
import { ElectronApiEvent } from "./types";

require('./rt/electron-rt');
//////////////////////////////

contextBridge.exposeInMainWorld("electronAPI", {
  createTxtFile: (data: { fileName: string; fileContent?: string }) =>
    ipcRenderer.invoke(ElectronApiEvent.createTxtFile, data),

});
// User Defined Preload scripts below
console.log('User Preload!');
