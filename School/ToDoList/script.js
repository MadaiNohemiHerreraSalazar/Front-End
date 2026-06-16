const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const pendingCount = document.getElementById('pendingCount');

// Carrega as tarefas do localStorage ou começa com um array vazio
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

// Função para desenhar as tarefas na tela
function renderTasks() {
    taskList.innerHTML = '';
    let pending = 0;

    tasks.forEach((task, index) => {
        // 1. Cria o li (container da tarefa)
        const li = document.createElement('li');
        
        // 2. Cria o span para o texto da tarefa
        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-text';
        taskTextSpan.textContent = task.text;

        // 3. Cria o botão de excluir
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✖';

        // Verifica se a tarefa está concluída para aplicar o estilo
        if (task.done) {
            li.classList.add('completed');
        } else {
            pending++;
        }

        // Evento para riscar a tarefa ao clicar APENAS no texto
        taskTextSpan.addEventListener('click', () => {
            toggleTask(index);
        });

        // Evento para excluir a tarefa ao clicar no botão '✖'
        deleteBtn.addEventListener('click', () => {
            deleteTask(index);
        });

        // Junta tudo dentro do li
        li.appendChild(taskTextSpan);
        li.appendChild(deleteBtn);

        // Coloca o li dentro da lista ul
        taskList.appendChild(li);
    });

    // Atualiza o contador de pendentes
    pendingCount.textContent = pending;

    // Salva no localStorage do navegador
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Função para adicionar nova tarefa
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Ops! Digite alguma tarefa antes de adicionar. 💕');
        return;
    }

    tasks.push({
        text: taskText,
        done: false
    });

    taskInput.value = '';
    taskInput.focus();
    renderTasks();
}

// Função para alternar o status de concluído (Check/Uncheck)
function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
}

// NOVA FUNÇÃO: Remove o item do Array usando o índice dele
function deleteTask(index) {
    // O .splice(index, 1) remove exatamente 1 item daquela posição do vetor
    tasks.splice(index, 1);
    renderTasks(); // Desenha a tela atualizada sem o item deletado
}

// Ouvintes de eventos (Cliques e Teclado)
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Inicialização da lista
renderTasks();