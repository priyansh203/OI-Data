async function getOI(CP,sP) {
  const index = "nifty";
  const num = "9"; // for banknifty num="23"
  const expiry = "2023-09-28";
  const CEPE = CP
  const strikePrice=sP

  let OI_long = 0;

  const url = `https://www.moneycontrol.com/india/indexfutures/${index}/${num}/${expiry}/OPTIDX/${CEPE}/${strikePrice}/true`;

  try {
    const response = await fetch(url);
    
    if (response.ok) {
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const divElement = doc.querySelector("div.FR.PA10");

      if (divElement) {
        const tableElement = divElement.querySelector("table");

        if (tableElement) {
          const cellData = [];
          const rows = tableElement.querySelectorAll("tr");

          for (const row of rows) {
            const columns = row.querySelectorAll("td");
            for (const column of columns) {
              cellData.push(column.textContent.trim());
            }
          }

          const OI_String = cellData[4].replace(/,/g, "");
          OI_long = parseInt(OI_String);
          // console.log(OI_long);
        } else {
          console.log("Table not found within the div.");
        }
      } else {
        console.log("Div element with class 'FR PA10' not found.");
      }
    } else {
      console.log("HTTP request failed with status:", response.status);
    }
  } catch (error) {
    console.error(error);
  }

  return OI_long;
}

let prevCE=0
let prevPE=0
async function displayOI() {
  try {
    const openInterestCE = await getOI("CE","19700.00");
    const openInterestPE = await getOI("PE","19750.00");
    const currentTime = new Date().toLocaleTimeString();
    let diffCE=openInterestCE-prevCE
    let diffPE=openInterestPE-prevPE

    // Create a unique key for this data (e.g., using a timestamp)
    const dataKey = Date.now().toString();

    // Save the data to local storage
    const savedData = {
      currentTime,
      openInterestCE,
      openInterestPE,
      diffCE,
      diffPE
    };
    localStorage.setItem(dataKey, JSON.stringify(savedData));
    
    const oiContainer = document.getElementById('openInterestContainer');
    const newDiv = document.createElement('div');
    newDiv.innerHTML = `
      <p>Current time: ${currentTime}</p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCE OI: ${openInterestCE}&nbsp&nbsp&nbsp&nbsp&nbspDiffCE: ${diffCE} </p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspPE OI: ${openInterestPE}&nbsp&nbsp&nbsp&nbsp&nbspDiffPE: ${diffPE}</p>
    `;
    oiContainer.appendChild(newDiv);
    prevCE=openInterestCE
    prevPE=openInterestPE
    

  } catch (error) {
    console.error(error);
  }
}

function loadAndDisplayData() {
  const oiContainer = document.getElementById('openInterestContainer');
  oiContainer.innerHTML = ''; // Clear existing divs

  // Loop through local storage items and display them
  for (let i = 0; i < localStorage.length; i++) {
    const dataKey = localStorage.key(i);
    const savedData = JSON.parse(localStorage.getItem(dataKey));

    const newDiv = document.createElement('div');
    newDiv.innerHTML = `
      <p>Current time: ${savedData.currentTime}</p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCE OI: ${savedData.openInterestCE}&nbsp&nbsp&nbsp&nbsp&nbspDiffCE: ${savedData.diffCE} </p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspPE OI: ${savedData.openInterestPE}&nbsp&nbsp&nbsp&nbsp&nbspDiffPE: ${savedData.diffPE}</p>
    `;
    oiContainer.appendChild(newDiv);
  }
}

// Function to clear data from local storage
function clearData() {
  localStorage.clear();
  const oiContainer = document.getElementById('openInterestContainer');
  oiContainer.innerHTML = ''; // Clear displayed divs
}

// Display the initial data and set an interval to update every 3 minutes
displayOI();
setInterval(displayOI, 3 * 60 * 1000); // 3 minutes in milliseconds

// Load and display data from local storage when the page loads
window.addEventListener('load', loadAndDisplayData);

// Attach event listener to the "Clear" button
const clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', clearData);
