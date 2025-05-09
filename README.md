# BlankSpace
### Описание
Приложение для заполнения юридических документов с помощью опроса.
1. Юрист составляет шаблон с использованием нашего синтаксиса (см. раздел синтаксис)
2. Менеджер заполняет опрос, сформированный приложением на основе шаблона
3. Генерируется готовый документ 
### Как запустить
1. Найдите окно релизов проекта
2. Выберите актуальную версию
3. Доступны 2 rar архива для скачивания.
4. Скачайте архив для своей операционной системы.
5. Распакуйте его и запустите файл BlankSpace.
6. При запуске должен открыться браузер с вкладкой, на которой открыто приложение
![image](https://github.com/user-attachments/assets/a499eee5-9e9c-4cf5-b0af-8722bee4441d)

#### Файлы для проверки
Файлы, на которых можно проверить работу системы лежат в релизе в папке Test_files
### Синтаксис шаблона
#### Поле для ввода данных:
~~~
{ВВОД (*Текст вопроса*)}
~~~

#### Выбор одного из нескольких вариантов:
~~~
{ЕСЛИ (*Текст вопроса*) (*Вариант ответа*)}
  **Контент внутри блока**
{КОНЕЦ ЕСЛИ}
~~~
Поддерживается вложенность вопросов. Все блоки 'ЕСЛИ' должны быть закрыты блоками 'КОНЕЦ ЕСЛИ'. Блоки с одинаковым текстом вопроса объединяются в 1 вопрос.
### Как запустить последнюю доступную версию
1. В github этого репозитория перейдите на страницу [Actions](https://github.com/AndreyRomanov1/BlankSpace/actions).
2. Там откройте одну из последних (верхних) workflow runs, с зелёной галочкой.
3. Пролистайте вниз: в разделе Artifacts доступны 2 файла для скачивания.
4. Скачайте архив для своей операционной системы.
5. Распакуйте его и можете запустить файл BlankSpace.
6. При запуске должен открыться браузер с вкладкой, на которой открыто приложение
#### Файлы для проверки
Файлы, на которых можно проверить работу системы лежат в репозитории в папке demo_files.
Там есть как файлы шаблонов, так и уже заполненные в системе.