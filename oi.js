async function getOI(CEPE,strikePrice,index,expiry) {
  // const index = "banknifty";
  let num = "9"; // for banknifty num="23"
  // const expiry = "2023-09-28";
  // const CEPE = "PE";
  // const strikePrice = "46100.00";
  let OI_long = 0;

  if(index==="banknifty"){
    num="23"
  }
  else{
    num="9"
  }
  console.log(num)
  

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



async function getSumation(CEPE,dataArray,index,expiry){
  let promises = []; // Store promises for each getOI call
  console.log(dataArray);
  
  for (let i = 0; i < dataArray.length; i++) {
    // Push each getOI call into the promises array
    promises.push(getOI(CEPE, dataArray[i], index, expiry));
  }

  // Use Promise.all to execute all promises concurrently and wait for all to complete
  let results = await Promise.all(promises);

  // Sum up the results
  let sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return sum;
  
}

function handleGetDataClick() {
  

  // Call the getData function with the array as a parameter
  // getSumation(dataArray);
  displayOI();
  setInterval(displayOI, 3 * 60 * 1000);
}


document.getElementById('getDataButton').addEventListener('click', handleGetDataClick);


let prevCE=0
let prevPE=0
let prevDiffInOI=0

async function displayOI() {
  try {
      // Get the user input from the text field
  
    // Split the input string into an array using space as the delimiter
    const index = document.getElementById('index').value;
    const expiry = document.getElementById('expiry').value;
    const userInput = document.getElementById('textfield').value;
    const dataArray = userInput.split(' ');
    
    
    
    const openInterestCE =  await getSumation("CE",dataArray,index,expiry);
    const openInterestPE = await getSumation("PE",dataArray,index,expiry);
    const currentTime = new Date().toLocaleTimeString();
    let diffCE=openInterestCE-prevCE
    let diffPE=openInterestPE-prevPE
    let diffCEPE=openInterestPE-openInterestCE
    let changeInDirection=diffCEPE-prevDiffInOI

    // Create a unique key for this data (e.g., using a timestamp)
    const dataKey = Date.now().toString();

    // Save the data to local storage
    const savedData = {
      currentTime,
      openInterestCE,
      openInterestPE,
      diffCE,
      diffPE,
      diffCEPE
    };
    localStorage.setItem(dataKey, JSON.stringify(savedData));


let oiTable = document.getElementById('openInterestTable');
    
    // Create a table if it doesn't exist
    if (!oiTable) {
      const newTable = document.createElement('table');
      newTable.id = 'openInterestTable';
      newTable.innerHTML = `
        <thead>
          <tr>
            <th>Current time</th>
            <th>CE OI</th>
            <th>PE OI</th>
            <th>Change in CE</th>
            <th>Change in PE</th>
            <th>Diff. in OI</th>
            <th>Change in Direction</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      oiTable = newTable;
      document.body.appendChild(oiTable);
    }

    const oiTableBody = oiTable.querySelector('tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${currentTime}</td>
      <td>${openInterestCE}</td>
      <td>${openInterestPE}</td>
      <td class="${diffCE <= 0 ? 'green-bg' : 'red-bg'}">${diffCE}</td>
      <td class="${diffPE >= 0 ? 'green-bg' : 'red-bg'}">${diffPE}</td>
      <td>${diffCEPE}</td>
      <td class="${changeInDirection >= 0 ? 'green-bg' : 'red-bg'}">${changeInDirection}</td>
      
    `;
    oiTableBody.appendChild(newRow);
    
    prevCE=openInterestCE
    prevPE=openInterestPE
    prevDiffInOI=diffCEPE
    

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
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspPE-CE: ${savedData.diffCEPE}</p>
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
// displayOI();
// setInterval(displayOI, 3 * 60 * 1000); // 3 minutes in milliseconds

// Load and display data from local storage when the page loads
// window.addEventListener('load', loadAndDisplayData);

// Attach event listener to the "Clear" button
const clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', clearData);
