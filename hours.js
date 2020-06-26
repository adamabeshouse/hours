const secondsWorked = JSON.parse(localStorage.secondsWorked || "{}");

let activeJobId = "";
let startingSeconds = -1;
let workIntervalStartMs = -1;

setInterval(()=>{
    if (activeJobId) {
        const currentMs = (new Date()).getTime();
        const timeWorkedMs = currentMs - workIntervalStartMs;
        const timeWorkedSeconds = Math.ceil(timeWorkedMs/1000);
        secondsWorked[activeJobId] = startingSeconds + timeWorkedSeconds;
        save();
        render();
    }
}, 1000);

$("#addJobSubmit").click(()=>{
    const jobId = $("#addJobName")[0].value;
    if (!jobId)
        return;

    if (jobId in secondsWorked) {
        alert("A job with that name already exists. Please choose a different name.");
    } else {
        // add job
        secondsWorked[jobId] = 0;
        // clear input
        $("#addJobName")[0].value = "";
        save();
    }

    render();
});

$("#resetTimers").click(()=>{
    const confirmed = confirm("Really reset all the timers to 0?");
    if (confirmed) {
        for (const jobId of Object.keys(secondsWorked)) {
            secondsWorked[jobId] = 0;
        }
        save();
        render();
    }
});

function save() {
    localStorage.secondsWorked = JSON.stringify(secondsWorked);
}
function renderTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;

    return `${hours}:${minutes}:${seconds}`
}
function render() {
    const jobsTbody = $("#jobs");
    jobsTbody.empty();

    const jobIds = Object.keys(secondsWorked);
    for (const jobId of jobIds) {
        const newRow = $("<tr>");

        $("<td>").appendTo(newRow).html(jobId);
        $("<td>").appendTo(newRow).html(renderTime(secondsWorked[jobId]));
        const buttonsTd = $("<td>").appendTo(newRow);
        const selectButton = $("<button>").appendTo(buttonsTd);
        selectButton.html(activeJobId ? "Switch" : "Start");
        selectButton.attr("disabled", jobId === activeJobId);
        selectButton.click(()=>{ activeJobId = jobId; startingSeconds = secondsWorked[jobId]; workIntervalStartMs = (new Date()).getTime(); render(); })
        if (activeJobId === jobId) {
            const stopButton = $("<button>").appendTo(buttonsTd);
            stopButton.html("Stop");
            stopButton.click(()=>{ activeJobId = ""; render(); })
        }
        const deleteButton = $("<button>").appendTo(buttonsTd);
        deleteButton.html("Delete");
        deleteButton.click(()=>{
            const confirmed = confirm(`Are you sure you want to delete ${jobId}?`);
            if (confirmed) {
                delete secondsWorked[jobId];
                if (activeJobId === jobId) {
                    activeJobId = "";
                }
                save();
                render();
            }
        })
        const renameButton = $("<button>").appendTo(buttonsTd);
        renameButton.html("Rename");
        renameButton.click(()=>{
            const forbiddenNames = jobIds.filter(x=>(x!==jobId));
            let name = prompt(`Rename ${jobId} to: `);
            while (forbiddenNames.includes(name)) {
                name = prompt(`That name already exists. Rename ${jobId} to: `)
            }
            if (name) {
                const seconds = secondsWorked[jobId];
                delete secondsWorked[jobId];
                secondsWorked[name] = seconds;
                if (activeJobId === jobId) {
                    activeJobId = name;
                }
                save();
                render();
            }
        });
        jobsTbody.append(newRow);
    }
}

window.render = render;

render();