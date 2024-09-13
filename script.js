window.addEventListener('load', () => {
    const form = document.querySelector('#task-form');
    const input = document.querySelector('#task-input');
    const list_el = document.querySelector('#tasks');

    // Function to capitalize the first letter of a string
    function capitalise(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Function to save all tasks to localStorage
    function saveTasks() {
        const tasks = Array.from(list_el.children).map(task_el => {
            const taskText = task_el.querySelector('.text').value;
            const elapsedTime = task_el.querySelector('.time').dataset.elapsedTime || 0;
            const startTime = task_el.querySelector('.time').dataset.startTime || null;
            return {
                taskText,
                elapsedTime,
                startTime
            };
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            createTask(task.taskText, task.elapsedTime, task.startTime);
        });
    }

    // Create a task element
    function createTask(taskText, elapsedTime = 0, startTime = null) {
        const task_el = document.createElement('div');
        task_el.classList.add('task');
        list_el.appendChild(task_el);

        const content_el = document.createElement('div');
        content_el.classList.add('content');
        task_el.appendChild(content_el);

        const input_el = document.createElement('input');
        input_el.classList.add('text');
        input_el.type = 'text';
        input_el.value = capitalise(taskText);
        input_el.setAttribute('readonly', 'readonly');
        content_el.appendChild(input_el);

        const counter_el = document.createElement('div');
        counter_el.classList.add('counter');
        task_el.appendChild(counter_el);

        const time_el = document.createElement('div');
        time_el.classList.add('time');
        time_el.innerText = formatTime(elapsedTime);
        time_el.dataset.elapsedTime = elapsedTime;
        time_el.dataset.startTime = startTime;
        counter_el.appendChild(time_el);

        const controls_el = document.createElement('div');
        controls_el.classList.add('controls');
        counter_el.appendChild(controls_el);

        const start_btn = document.createElement('button');
        start_btn.classList.add('start');
        start_btn.innerText = "Start";

        const stop_btn = document.createElement('button');
        stop_btn.classList.add('stop');
        stop_btn.innerText = "Stop";

        const reset_btn = document.createElement('button');
        reset_btn.classList.add('reset');
        reset_btn.innerText = "Reset";

        controls_el.appendChild(start_btn);
        controls_el.appendChild(stop_btn);
        controls_el.appendChild(reset_btn);

        const actions_el = document.createElement('div');
        actions_el.classList.add('actions');
        task_el.appendChild(actions_el);

        const edit_btn = document.createElement('button');
        edit_btn.classList.add('edit');
        edit_btn.innerText = "Edit Task";

        const delete_btn = document.createElement('button');
        delete_btn.classList.add('delete');
        delete_btn.innerText = "Delete Task";

        actions_el.appendChild(edit_btn);
        actions_el.appendChild(delete_btn);

        // Timer state
        let startTimeLocal = startTime ? parseFloat(startTime) : null;
        let elapsedTimeLocal = parseFloat(elapsedTime);
        let interval = null;

        function saveTimerState() {
            if (startTimeLocal !== null) {
                const now = performance.now();
                localStorage.setItem(`elapsedTime-${taskText}`, elapsedTimeLocal + (now - startTimeLocal) / 1000);
                localStorage.setItem(`startTime-${taskText}`, startTimeLocal);
                time_el.dataset.elapsedTime = elapsedTimeLocal + (now - startTimeLocal) / 1000;
                time_el.dataset.startTime = startTimeLocal;
            }
        }

        function formatTime(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function updateTimerDisplay() {
            time_el.innerText = formatTime(elapsedTimeLocal);
        }

        function start() {
            if (interval) return;
            startTimeLocal = performance.now();
            interval = setInterval(() => {
                const now = performance.now();
                elapsedTimeLocal += (now - startTimeLocal) / 1000;
                startTimeLocal = now;
                updateTimerDisplay();
                saveTimerState();
            }, 1000);
        }

        function stop() {
            clearInterval(interval);
            interval = null;
            saveTimerState();
        }

        function reset() {
            stop();
            elapsedTimeLocal = 0;
            updateTimerDisplay();
            localStorage.removeItem(`startTime-${taskText}`);
            localStorage.removeItem(`elapsedTime-${taskText}`);
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                stop();
            } else {
                start();
            }
        }

        edit_btn.addEventListener('click', () => {
            if (edit_btn.innerText.toLowerCase() === 'edit task') {
                input_el.removeAttribute('readonly');
                input_el.focus();
                edit_btn.innerText = "Save";
            } else {
                input_el.setAttribute('readonly', 'readonly');
                edit_btn.innerText = "Edit Task";
            }
        });

        delete_btn.addEventListener('click', () => {
            list_el.removeChild(task_el);
            localStorage.removeItem(`startTime-${taskText}`);
            localStorage.removeItem(`elapsedTime-${taskText}`);
            saveTasks();
        });

        start_btn.addEventListener('click', start);
        stop_btn.addEventListener('click', stop);
        reset_btn.addEventListener('click', reset);

        updateTimerDisplay();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const task = capitalise(input.value);

        if (!task) {
            alert("Please add a task");
            return;
        }

        createTask(task);
        input.value = "";
        saveTasks();
    });

    loadTasks();
});
