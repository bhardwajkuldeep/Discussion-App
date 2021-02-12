var DATA = [];

const questionForm = document.getElementById('question');
const welcome = document.getElementById('welcome');
const response = document.getElementById('response');
const quesInfo = document.getElementById('ques-info');
const resolveBtn = document.getElementById('resolve');
const quesList = document.getElementsByTagName('ul')[0];
const newQuesBtn = document.getElementById('new-ques');
const responseBtn = document.getElementById('response-submit');
const query = document.getElementById('query');
const noMatchFound = document.getElementById('no-match-found');
const responseForm = document.getElementById('responseForm');
const responseList = document.getElementById('responseList');
const index = document.getElementById('pos');

newQuesBtn.addEventListener('click', () => {
    response.classList.add('d-none');
    welcome.classList.remove('d-none');
});

function generateHighlightIndex(search, text) {
    let s = 0;
    let arr = [];
    text = text.toLowerCase();
    while(s < text.length) {
        let beg = text.indexOf(search, s);
        if(beg === -1) break;
        s = beg + search.length;
        arr.push({beg, end: s});
    }
    return arr;
}

query.addEventListener('keyup', () => {
    let search = query.value.toLowerCase().trim();
    if(search.length === 0) {
        renderQuestionList(DATA);
        return;
    }
    let matches = 0;
    DATA.forEach((obj, ind, arr) => {
        obj.subjHighLight = generateHighlightIndex(search, obj.subj);
        obj.quesHighlight = generateHighlightIndex(search, obj.ques);
        matches += obj.subjHighLight.length + obj.quesHighlight.length;
    });
    if(matches === 0) renderNoMatchFound();
    else renderQuestionList(DATA, true);
});

function renderResponseList(responses) {
    responseList.innerHTML = '';
    responses.forEach((resp, pos) => {

        let div = createBox(resp.name, resp.message);
        div.classList.add('bg-light');
        div.classList.remove('border-bottom');

        let list = createList();

        list.addEventListener('click', () => {
            localStorage.setItem("DATA", JSON.stringify(DATA));
            displayResponseArea(index.value);
        });

        responseList.appendChild(div);
    });
}

function renderQuestionInfo(question) {
    let div = createBox(question.subj, question.ques);

    let list = createList();
    

    list.addEventListener('click', () => {
        localStorage.setItem("DATA", JSON.stringify(DATA));
        index.value = DATA.indexOf(question);
        renderQuestionList(DATA);
        displayResponseArea(index.value);
    });

    quesInfo.innerHTML = '';
    quesInfo.appendChild(div);
}

function deleteQuestion() {
    DATA.splice(index.value, 1);
    localStorage.setItem('DATA', JSON.stringify(DATA));
    renderQuestionList(DATA);
    response.classList.add('d-none');
    welcome.classList.remove('d-none');
}

function addResponse(e) {
    e.preventDefault();
    let name = responseForm.username.value, message = responseForm.response.value;
    responseForm.username.value = '';
    responseForm.response.value = '';
    let q = DATA[responseForm.qId.value];
    q.response.push({name, message});
    localStorage.setItem('DATA', JSON.stringify(DATA));
    renderResponseList(q.response);
}

function displayResponseArea(pos) {
    index.value = pos;
    welcome.classList.add('d-none');
    response.classList.remove('d-none');
    renderQuestionInfo(DATA[pos]);
    renderResponseList(DATA[pos].response);
}

function generateHighlight(parent, text, highlights) {
    let s = 0;
    let piece = '';
    highlights.forEach((obj) => {
        piece = document.createTextNode(text.substring(s, obj.beg));
        parent.appendChild(piece);
        let span = document.createElement('span');
        piece = document.createTextNode(text.substring(obj.beg, obj.end));
        s = obj.end;
        span.appendChild(piece);
        parent.appendChild(span);
    });
    if(s < text.length) {
        piece = document.createTextNode(text.substring(s, text.length));
        parent.appendChild(piece);
    }
}

function createBox(title, subtitle, isQueryList = false, titleHighlight = [], subtitleHighlight = []) {
    let h5 = document.createElement('h5');
    h5.setAttribute('class','');
    if(!isQueryList) {
        let header = document.createTextNode(title);
        h5.appendChild(header);
    }
    else generateHighlight(h5, title, titleHighlight);

    let p = document.createElement('p');
    p.setAttribute('class', 'text-secondary');
    if(!isQueryList) {
        let body = document.createTextNode(subtitle);
        p.appendChild(body);
    }
    else generateHighlight(p, subtitle, subtitleHighlight);

    let div = document.createElement('div');
    div.setAttribute('class', 'border-bottom');
    div.appendChild(h5);
    div.appendChild(p);
    
    return div;
}

function createList() {
    let list = document.createElement('i');
    list.setAttribute('class','');
    return list;
}


function renderQuestionList(questions, isQueryList = false) {
    if(query.value.trim() !== '') isQueryList = true;
    quesList.innerHTML = '';
    noMatchFound.classList.add('d-none');
    questions.forEach((obj, pos) => {
        if(isQueryList && obj.quesHighlight.length === 0 && obj.subjHighLight.length === 0) {}
        
        else {
            let div = createBox(obj.subj, obj.ques, isQueryList, obj.subjHighLight, obj.quesHighlight);

            let li = document.createElement('li');
            li.appendChild(div);
            li.addEventListener('click', () => displayResponseArea(pos));
            quesList.appendChild(li);
        }
    });
}

function renderNoMatchFound() {
    quesList.innerHTML = '';
    noMatchFound.classList.remove('d-none');
}

questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let ques = questionForm.ques.value, subj = questionForm.subject.value;
    questionForm.ques.value = '';
    questionForm.subject.value = '';
    DATA.push({ques, subj, quesHighlight: [], subjHighLight: [], response: []});
    localStorage.setItem('DATA', JSON.stringify(DATA));
    renderQuestionList(DATA);
});

responseForm.addEventListener('submit', addResponse);

resolveBtn.addEventListener('mouseup', deleteQuestion);

function setup() {
    if(localStorage.getItem("DATA")) DATA = JSON.parse(localStorage.getItem("DATA"));

    renderQuestionList(DATA);
    response.classList.add('d-none');
    welcome.classList.remove('d-none');
}

setup();