function performCheck(ticker, key) {
  if (ticker == "" || key == "") {
    alert("Please fill in both fields!");
    return false;
  } else {
    return true;
  }
}

function returnVal(formId) {
  if (document.getElementById(formId).value == null) {
    return "";
  } else {
    return document.getElementById(formId).value;
  }
}

function returnCallUrl(ticker, key) {
  return (
    "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" +
    ticker +
    "&apikey=" +
    key
  );
}

function performFetch(ticker, key) {
  if (performCheck(returnVal(ticker), returnVal(key))) {
    fetch(returnCallUrl(returnVal(ticker), returnVal(key)))
      .then((response) => response.json())
      .then((data) => responseHandle(data))
      .then(() => (document.getElementById("output").scrollTop = 0));
  }
}

function responseHandle(resObj) {
  console.log(resObj);
  console.log(Object.keys(resObj)[1]);
  loopData(resObj);
}

async function loopData(data) {
  let seriesType = Object.keys(data)[1];
  destroyChildren(tableId);
  for (item in data[seriesType]) {
    //console.log(data[seriesType][date]);
    //console.log(date);
    let date = new Date(item + "T00:00:00");
    let open = data[seriesType][item]["1. open"];
    let close = data[seriesType][item]["4. close"];
    let volume = data[seriesType][item]["5. volume"];
    appendTrRow(tableId, date, open, close, volume);
  }
  document.getElementById("tableDisplayButton").removeAttribute("hidden");
}

function createTableChild(date, open, close, volume) {
  let wrapper = document.createElement("tr");
  wrapper.appendChild(createTableCell(date.formatMMDDYYYY()));
  wrapper.appendChild(createTableCell(parseFloat(open).toFixed(2)));
  wrapper.appendChild(createTableCell(parseFloat(close).toFixed(2)));
  wrapper.appendChild(createTableCell(numberWithCommas(volume)));
  return wrapper;
}

function destroyChildren(elemId) {
  document.getElementById(elemId).innerHTML = "";
}

function createTableCell(cellData) {
  let cell = document.createElement("td");
  cell.innerHTML = cellData;
  return cell;
}

function appendTrRow(tableId, date, open, close, volume) {
  document
    .getElementById(tableId)
    .appendChild(createTableChild(date, open, close, volume));
}

function buttonSubmit() {
  progressBarUpdate(progressId);
}

function tableToggle() {
  let hiddenTable = document.getElementById("table");
  let toggleButton = document.getElementById("tableDisplayButton");
  if (hiddenTable.hasAttribute("hidden")) {
    hiddenTable.hidden = false;
    toggleButton.className = "btn btn-danger";
    toggleButton.innerHTML = "Hide Table";
  } else {
    hiddenTable.hidden = true;
    toggleButton.className = "btn btn-primary";
    toggleButton.innerHTML = "Display Table";
  }
}

let tickerId = "tickerForm";
let keyId = "keyForm";
let tableId = "outputTable";
let progressId = "progressElement";

window.onload = function () {
  let tickerField = document.getElementById(tickerId);
  if (tickerField) {
    tickerField.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        buttonSubmit();
      }
    });
  }
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

Date.prototype.formatMMDDYYYY = function () {
  return this.getMonth() + 1 + "/" + this.getDate() + "/" + this.getFullYear();
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function progressBarUpdate(elemId) {
  let hiddenTable = document.getElementById("table");
  let toggleButton = document.getElementById("tableDisplayButton");
  hiddenTable.hidden = true;
  toggleButton.hidden = true;
  toggleButton.className = "btn btn-primary";
  toggleButton.innerHTML = "Display Table";
  let bar = document.getElementById(elemId);
  let container = document.getElementById("progressToggle");
  let width = 25;
  bar.style.width = width + "%";
  container.hidden = false;
  bar.innerHTML = "&#128142;&#128080; Polishing diamond hands...";
  let id = setInterval(frame, 110);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      container.hidden = true;
      performFetch(tickerId, keyId);
    } else if (width >= 95) {
      bar.innerHTML = "&#128640;TO THE MOON!";
      width++;
      bar.style.width = width + "%";
    } else if (width >= 75) {
      bar.innerHTML = "&#128021;Mining Dogecoin...";
      width++;
      bar.style.width = width + "%";
    } else if (width >= 50) {
      bar.innerHTML = "&#128200;STONKS!!";
      width++;
      bar.style.width = width + "%";
    } else {
      width++;
      bar.style.width = width + "%";
    }
  }
}
