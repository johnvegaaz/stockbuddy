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
  let dateArr = [];
  let openArr = [];
  let closeArr = [];
  let volumeArr = [];
  for (item in data[seriesType]) {
    //console.log(data[seriesType][date]);
    //console.log(date);
    let date = new Date(item + "T00:00:00");
    dateArr.push(date.formatMMDDYYYY());
    let open = data[seriesType][item]["1. open"];
    openArr.push(open);
    let close = data[seriesType][item]["4. close"];
    closeArr.push(close);
    let volume = data[seriesType][item]["5. volume"];
    volumeArr.push(volume);
    appendTrRow(tableId, date, open, close, volume);
  }

  document.getElementById("tableDisplayButton").removeAttribute("hidden");
  return [
    dateArr.reverse(),
    openArr.reverse(),
    closeArr.reverse(),
    volumeArr.reverse(),
  ];
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

async function executePull() {
  const response = await fetch(
    returnCallUrl(returnVal(tickerId), returnVal(keyId))
  );
  const data = await response.json();
  //Not the best idea but I want to push the appropriate values into arrays from the loopData function, later on I will add in a better higher order array function/method
  let [dateArr, openArr, closeArr, volumeArr] = await loopData(data);
  console.log(data);
  console.log(dateArr);
  console.log(openArr);
  console.log(closeArr);
  console.log(volumeArr);

  chartIt(dateArr, closeArr);
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
  bar.style.width = 100 + "%";
  container.hidden = false;
  bar.innerHTML = "&#128142;&#128080; Polishing diamond hands...";
  let id = setInterval(frame, 110);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      executePull();
      container.hidden = true;
    } else if (width >= 95) {
      bar.innerHTML = "&#128640;TO THE MOON!";
      width++;
    } else if (width >= 75) {
      bar.innerHTML = "&#128021;Mining Dogecoin...";
      width++;
    } else if (width >= 50) {
      bar.innerHTML = "&#128200;STONKS!!";
      width++;
    } else {
      width++;
    }
  }
}

//CHART STUFF
function chartIt(x, y) {
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: x,
      datasets: [
        {
          label: "Closing Price",
          data: y,
          borderColor: ["rgba(255, 99, 132, 1)"],
          pointHitRadius: 3,
          pointStyle: "line",
          pointRotation: 90,
          borderWidth: 1,
          lineTension: 0,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
            },
          },
        ],
      },
    },
  });
}
