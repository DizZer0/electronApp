import { useEffect, useState } from 'react';
import './App.scss';

function App() {
  const [fileName, setFileName] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [namesList, setNamesList] = useState<string[]>([])


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

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(json => console.log(json))
    // fetch('https://randomuser.me/api/?results=5')
    //   .then(res => res.json())
    //   .then(data => {
    //     const names = data.results.map((user: any) => `${user.name.first} ${user.name.last}`);
    //     setNamesList(names)
    //   });
  }, [])

  return (
    <div className="App">
      <div className='list-name'>
        {namesList.map(name => <span className='list-name__item' key={name}>{name}</span>)}
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
