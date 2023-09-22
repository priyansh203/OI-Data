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
  let sum=0;
  
    console.log(dataArray);
  for(i=0;i<dataArray.length-1;i++)
  {
    let temp = await getOI(CEPE,dataArray[i],index,expiry);
    
    sum=sum+temp
  }
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
    
    const oiContainer = document.getElementById('openInterestContainer');
    const newDiv = document.createElement('div');
    newDiv.innerHTML = `
      <p>Current time: ${currentTime}</p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCE OI: ${openInterestCE}&nbsp&nbsp&nbsp&nbsp&nbspDiffCE: ${diffCE} </p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspPE OI: ${openInterestPE}&nbsp&nbsp&nbsp&nbsp&nbspDiffPE: ${diffPE}</p>
      <p>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspPE-CE: ${diffCEPE}</p>
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
window.addEventListener('load', loadAndDisplayData);

// Attach event listener to the "Clear" button
const clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', clearData);
