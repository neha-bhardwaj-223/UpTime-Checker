var tBodyCllg = document.getElementById("table-content-college");
var tBodySmartProf = document.getElementById("table-content-smartprof");
var tBodyGovt = document.getElementById("table-content-govt");

function addItem(event) {
    if (typeof (event) == 'string' && event !== "") {
        let linksDataObj = JSON.parse(linksData);
        let divElement = '';
        let count = 1;
        for (var urlLinks in linksDataObj) {
            let { ssl, status, statusText, date, category, title } = linksDataObj[`${urlLinks}`];
            if (status == 200)
                divElement = `<div class= "green"></div>`
            else
                divElement = `<div class= "red"></div> ${status}`

            var tableString = `<tr>
            <td>${count++}</td>
            <td>${title}</td>
            <td>${urlLinks}</td>
            <td>${ssl}</td>
            <td>${statusText}</td>
            <td>${divElement}</td>   
            <td>${date}</td>
          </tr>`;
            if (category == 'Govt')
                tBodyGovt.innerHTML += tableString;
            else if (category == 'College')
                tBodyCllg.innerHTML += tableString;
            else
                tBodySmartProf.innerHTML += tableString;

        }
    }
}



/// Reading Links and initialiazing table
var readLinks = false;
var linksData = "";

const readData = () => {
    const xhttp = new XMLHttpRequest();
    $(".progress-bar").animate({
        width: "70%",
    }, 500);
    xhttp.onload = function () {
        readLinks = true;
        linksData = this.responseText;
        $(".progress-bar").animate({
            width: "100%",
        }, addItem(linksData));
    }

    xhttp.open("POST", "./read");
    xhttp.send();
}

if (!readLinks) {
    readData();
}
