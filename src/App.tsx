import { useState } from 'react';
import './App.scss';
import { useNetworkStatus } from './hooks/useNetworkStatus';

function App() {
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");

  const { isOnline } = useNetworkStatus();

  const createAndSaveTxtFile = async (fileName: string, fileContent: string): Promise<void> => {
    try {
      const result = await window.electronAPI.createTxtFile({
        fileName,
        fileContent,
    });
      console.log(result)
      if (result.success) {
        alert("Файл сохранен")
      } else {
        alert("Файл не сохранен")
      }
    } catch (error) {
      console.log(error)
      alert("Ошибка")
    }
  }

  return (
    <div className="App">
      <div className='network-status'>
        Подключение к сети 
        <div className={`network-status__indicator ${isOnline ? "online" : ""}`}/>
      </div>
      <div className='form' >
        <div className='form__input'>
          Имя файла
          <input onChange={(e) => setFileName(e.currentTarget.value)}></input>
        </div>
        <div className='form__input'>
          Текст файла
          <input onChange={(e) => setFileContent(e.currentTarget.value)}></input>
        </div>
        <button className='form__button' onClick={() => createAndSaveTxtFile(fileName, fileContent)}>Создать</button>
      </div>
    </div>
  );
}

export default App;
