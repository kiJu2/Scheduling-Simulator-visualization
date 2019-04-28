$(document).ready(function() {
  $('#processesButton').on('click', function() {
    var cycleNum = $('#processes').val();
    $('#outputArea').html("");
    $('#inputArea').html("<select style = 'margin: 20px auto 15px auto; display : block'\
    id = 'selectScheduling'>\
      <option>FCFS</option>\
      <option>RR</option>\
      <option>SPN</option>\
      <option>SPTN</option>\
      <option>HRRN</option>\
    </select>");

    $('#outputArea').css('display', 'none');

    let i = 0;
    for (; i < cycleNum; i++) {
      $('#inputArea').append("\
      <b class = 'inputTime" + String(i) + "' style = 'font-size: 10px; text-align: left;display: none;'>Process " + String(i) + "</b><br>\
      <input class = 'inputTime" + String(i) + "' id = 'arrivalTime" + String(i) + "' type = 'number' placeholder='Arrival Time' style = 'margin-bottom: 4px;display: none;'><br>\
      <input class = 'inputTime" + String(i) + "' id = 'burstTime" + String(i) + "' type = 'number' placeholder='Burst Time' style = 'margin-bottom: 4px;display: none;'><br>\
      <input class = 'inputTime" + String(i) + "' id = 'quantumTime" + String(i) + "' type = 'number' placeholder='Quantum Time' style = 'margin-bottom: 15px;display: none;'><br>\
      ");
    }
    $('#inputArea').append("<input id = 'inputTimeButton' class = 'inputTime" + String(i) + "' type = 'button' value = 'Show me!' style = 'display:none'>");
    $('#outputArea').addClass("inputTime" + String(i + 1));

    let timing = 0;
    for (let i = 0; i <= cycleNum + 1; i++) {
      $(".inputTime" + String(i)).delay(timing).fadeIn(1000);
      timing += 200;
    }
    $('#inputArea').append("<input id = 'processMax' type = 'hidden' value = " + String(cycleNum) + ">");
  })
  //let processes, let arrivalTime, let burstTime, let timeQuantum let waitingTime, let turnAroundTime, let normalizedTurnAroundTime, let intervalRunTime, let runSequence



  //프로세스 수, 도착 시간, 실행 시간, 제한 시간(RR전용)			: 입력 받아야 할 변수
  let processes;
  let arrivalTime = new Array();
  let _arrivalTime = new Array();
  let cloneArrivalTime = new Array();
  let burstTime = new Array();
  let timeQuantum = 0;
  //대기 시간, 결과 시간, TT/WT									: 반환 받아야 할 변수
  //WT = TT - BT; NTT = TT / BT
  let waitingTime = new Array();
  let turnAroundTime = new Array();
  let normalizedTurnAroundTime = new Array();
  //구간 별 실행시간												: 시각화에 필요한 변수
  let intervalRunTime = new Array(); //실행 시간
  let runSequence = new Array(); //실행 순서
  let queueLine = new Array(); //대기열 Q 대기시간
  let queueLineName = new Array(); //대기열 Q의 프로세스 순서(프로세스 네임);
  //시각화 데이터
  let colorCode = new Array();
  let colorProcess = new Array();
  //----------------------데이터 출력----------------------
  function showChart() {
    console.log("------showCahrt------");

    // 차트 생성
    //차트 이름 생성
    $('#ganttArea').append("<p id = 'runChartP'>Process run chart</p>");
    $('#runChartP').fadeIn(1000);
    //고유 색상 지정
    colorCode.push("#D5D5D5");
    colorCode.push("#FFB2D9");
    colorCode.push("#D1B2FF");
    colorCode.push("#B5B2FF");
    colorCode.push("#B2CCFF");
    colorCode.push("#B2EBF4");
    colorCode.push("#B7F0B1");
    colorCode.push("#CEF279");
    colorCode.push("#FAED7D");
    colorCode.push("#FFE08C");
    colorCode.push("#FFC19E");
    colorCode.push("#FFA7A7");

    let colorEmpty = "#4C4C4C";
    let colorOption = 0;
    for (let i = 0; i < processes; i++) {
      colorProcess.push(colorCode[colorOption]);
      colorOption++;
      if (i >= 12) colorOption = 0;
    }
    console.log("colorProcess : " + colorProcess);

    for (let cycleNum = 0; cycleNum < intervalRunTime.length; cycleNum++) {
      $('#ganttArea').append("\
          <div id = 'chartBar" + String(cycleNum) + "' style = '\
          " + ((cycleNum == 0) ? "margin-left : 10%;" : "") + "\
          position : static;\
          width : 0px;\
          height : 19px;\
          float : left;\
          background-color : " + ((Number(runSequence[cycleNum]) == -1) ? colorEmpty : colorProcess[runSequence[cycleNum]]) + ";\
          '></div>");
      console.log("colorProcess[runSequence[cycleNum]]) : " + colorProcess[runSequence[cycleNum]]);
      console.log("runSequence[cycleNum] : " + runSequence[cycleNum]);
    }
    // 애니메이션

    // 각 div의 길이를 구함
    let maxBurstTime = 0;
    let maxLength = 400;
    let percentageLength = new Array();
    console.log("---------animate----------")
    //비율을 구함
    for (let i = 0; i < intervalRunTime.length; i++) maxBurstTime += Number(intervalRunTime[i]);
    for (let i = 0; i < intervalRunTime.length; i++) {
      percentageLength.push(parseFloat(parseFloat(intervalRunTime[i]) / parseFloat(maxBurstTime)));
      // console.log("intervalRunTime " + String(intervalRunTime[i]));
      // console.log("maxBurstTime " + String(maxBurstTime));
      // console.log("percentageLength : " + String(percentageLength[i]));
    }
    //------------------------------------------------
    //시간 및 동작
    //프로세스의 수에 따라서 시간을 변동시키자, 처음 시작할 때 너무 느려
    let timing = 0;
    let timingMaximum = intervalRunTime.length * 1000;

    for (let cycleNum = 0; cycleNum < intervalRunTime.length; cycleNum++) {
      setTimeout(function() {
        $('#chartBar' + String(cycleNum)).animate({
          width: (percentageLength[cycleNum] * 400)
        }, parseFloat(percentageLength[cycleNum]) * Number(timingMaximum));
        // console.log("percentageLength[cycleNum] : " + String(percentageLength[cycleNum]));
        // console.log("parseFloat(percentageLength[cycleNum]) * timingMaximum : " + parseFloat(percentageLength[cycleNum]) * timingMaximum);
      }, timing);
      timing += parseFloat(percentageLength[cycleNum]) * Number(timingMaximum);
      console.log("timing : " + timing);
      console.log("parseFloat(percentageLength[cycleNum]) * timingMaximum : " + parseFloat(percentageLength[cycleNum]) * timingMaximum);
    }

    //프로세스 색상표
    let pro = 0;
    $('#ganttArea').append("<div id = 'colorTable' style = 'text-align : right;'></div>");
    for(let i = 0 ; i < processes; i ++){
      $('#colorTable').append("\
        <div id = 'processColor"+ String(i) +"' class = 'processColor'>\
          <p id = 'processColorName"+ String(i) +"' class = 'processColorName'>process "+ String(i) +"</p>\
          <div id = 'processColorBox"+ String(i) +"' class = 'processColorBox' style = 'background-color: "+ colorProcess[i] +";'> </div>\
        </div>\
      ");
      pro ++;
    }

  }

  function showData() {
    let processName = "processName";
    $('#outputArea').html("");
    let cycleNum2 = 0;
    for (cycleNum2 = 0; cycleNum2 < processes; cycleNum2++) {
      $('#outputArea').append("\
    <div id = 'datasName" + String(cycleNum2) + "' style = 'display : none'>\
      <h style = 'font-size : 10px; margin-left : 3%; font-weight: bold'>process " + String(cycleNum2) + "</h>\
      <table style = 'margin-left: 3%; margin-right: 3%; margin-top: 10px;background-color: rgba( 255, 255, 255, 0.5 );\
      border-radius: 4px;'>\
        <tr>\
          <th style = 'font-size: 8px; width : 7%'>\
            Arrival Time\
          </th>\
          <th style = 'font-size: 8px; width : 7%'>\
            Burst Time\
          </th>\
          <th style = 'font-size: 8px; width : 7%'>\
            Time Quantum\
          </th>\
          <th style = 'font-size: 8px; width : 7%'>\
            Waiting Time\
          </th>\
          <th style = 'font-size: 8px; width : 7%'>\
            Turnaround Time\
          </th>\
          <th style = 'font-size: 8px; width : 7%'>\
            NTT\
          </th>\
        </tr>\
        <tr>\
          <td style = 'font-size: 8px;'>" + String(_arrivalTime[cycleNum2]) + "</td>\
          <td style = 'font-size: 8px;'>" + String(burstTime[cycleNum2]) + "</td>\
          <td style = 'font-size: 8px;'>" + String(timeQuantum[cycleNum2]) + "</td>\
          <td style = 'font-size: 8px;'>" + String(waitingTime[cycleNum2]) + "</td>\
          <td style = 'font-size: 8px;'>" + String(turnAroundTime[cycleNum2]) + "</td>\
          <td style = 'font-size: 8px;'>" + String(parseInt(normalizedTurnAroundTime[cycleNum2] * 100) / 100) + "</td>\
        </tr>\
      </table>\
    </div>\
    ");
    }

    let timing = 0;
    for (let i = 0; i <= cycleNum2 + 1; i++) {
      $("#datasName" + String(i)).delay(timing).fadeIn(1000);
      timing += 200;
    }
  }
  //----------------------FCFS-----------------------
  function fcfs() {
    console.log("----FCFS Run----");
    let processes = $('#processMax').val();
    let min = arrivalTime[0];
    let max = arrivalTime[0];
    let optionProcess;
    let currentTime = 0;
    let endTime = 0;
    let emptyTime = 0;
    let temp;

    let arrivalTimeName = new Array();

    // for (let i = 0; i < processes; i++) {
    //   for (let j = i + 1; j < processes; j++) {
    //     if (Number(cloneArrivalTime[i]) > Number(cloneArrivalTime[j])) {
    //       temp = arrivalTimeName[i];
    //       arrivalTimeName[i] = Number(arrivalTimeName[j]);
    //       arrivalTimeName[j] = Number(temp);
    //
    //       temp = cloneArrivalTime[i];
    //       cloneArrivalTime[i] = Number(cloneArrivalTime[j]);
    //       cloneArrivalTime[j] = Number(temp);
    //     }
    //   }
    // }

    for (let i = 0; i < processes; i++) if (cloneArrivalTime[i] >= max) max = cloneArrivalTime[i];

    for (let pro = 0; pro < processes; pro++) {
      //도착시간이 가장 가까운 것을 도출.
      console.log("Data setting num : " + String(pro));
      for (let i = 0; i < processes; i++) {
  			for (let j = 0; j < processes; j++) {
  				if (Number(cloneArrivalTime[i]) <= Number(min) && Number(cloneArrivalTime[i]) > 0) min = Number(cloneArrivalTime[i]);
  			}
  			if (cloneArrivalTime[i] == min) {
  				min = Number(cloneArrivalTime[i]);
  				optionProcess = i;
  			}
			//사용된 변수는 음수화 처리하여 재사용 불능으로 만듦
  		}
      console.log("OptionProcess : " + String(optionProcess));
      currentTime += Number(burstTime[optionProcess]);
      emptyTime = Number(cloneArrivalTime[optionProcess]) - Number(endTime);
      if (emptyTime < 0) emptyTime = 0;
      currentTime += Number(emptyTime);

      //cout << "현재 시간 : " << currentTime << endl;
      //cout << "현재 도착 시간 [" << optionProcess << "] : " << arrivalTime[optionProcess] << endl;
      turnAroundTime[optionProcess] = Number(currentTime) - Number(cloneArrivalTime[optionProcess]);
      waitingTime[optionProcess] = (Number(currentTime) - Number(cloneArrivalTime[optionProcess])) - Number(burstTime[optionProcess]);
      normalizedTurnAroundTime[optionProcess] = parseFloat(turnAroundTime[optionProcess]) / parseFloat(burstTime[optionProcess]);

      queueLine.push(Number(waitingTime[Number(optionProcess)]));
      queueLineName.push(Number(optionProcess));

      if (waitingTime[optionProcess] < 0) waitingTime[optionProcess] = 0;

      if (emptyTime > 0) {
        runSequence.push(-1);
        intervalRunTime.push(emptyTime);
      }
      //구간 별 실행시간, 실행 순서 누적 그리고 현재 시간 갱신
      intervalRunTime.push(burstTime[optionProcess]);
      runSequence.push(optionProcess);

      endTime = Number(currentTime);
      min = Number(max);
      cloneArrivalTime[optionProcess] = -1;
    }
  }

  // Show me ! 실행
  $(document).on('click', '#inputTimeButton', function(event) {
    console.log("show me Click.");
    //---------------------입력 구간-----------------
    //		입력구간은 수정하지 않으셨으면 합니다 !

    //프로세스 수 지정
    processes = $('#processMax').val();
    console.log($('#processMax').val());
    let select = $("#selectScheduling option:selected").text();

    //도착 시간 지정
    for (let i = 0; i < processes; i++) {
      arrivalTime[i] = $('#arrivalTime' + String(i)).val();
      _arrivalTime[i] = arrivalTime[i];
      cloneArrivalTime[i] = Number(arrivalTime[i]);
    }
    //실행 시간 지정
    for (let i = 0; i < processes; i++) {
      burstTime[i] = $('#burstTime' + String(i)).val();
    }

    //RR전용
    //cout << "Time quantum for RR : ";
    //---------------------출력 구간-----------------
    //reffrenceTimes(processes, arrivalTime, burstTime, timeQuantum, waitingTime, turnAroundTime, normalizedTurnAroundTime, intervalRunTime, runSequence);
    if (select == "FCFS") fcfs();
    showData();
    showChart();
    for (let i = 0; i < processes; i++) {
      console.log("arrivalTime : " + String(arrivalTime[i]));
      console.log("burstTime : " + String(burstTime[i]));
    }
    for (let i = 0; i < Number(processes); i++) {
      console.log("waitTime process" + String(i) + " : " + Number(waitingTime[i]));
      console.log("TT" + String(i) + " : " + Number(turnAroundTime[i]));
      console.log("NTT" + String(i) + " : " + String(normalizedTurnAroundTime[i]));
      console.log(typeof(normalizedTurnAroundTime[i]));
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("queueLineName : " + String(queueLineName[i]) + "      " + "queueLine : " + String(queueLine[i]));
    }
    for (let i = 0; i < intervalRunTime.length; i++) {
      console.log("runSequence : " + String(runSequence[i]) + "      " + "intervalRunTime : " + String(intervalRunTime[i]));
    }
  })
}); // end of ready()
