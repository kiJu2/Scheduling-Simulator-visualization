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
//첫 클릭
$(document).ready(function() {
  $('#processesButton').on('click', function() {
    var cycleNum = $('#processes').val();
    //초기화
    $('#outputArea').html("");
    $('#ganttArea').html("");
    intervalRunTime = new Array(); //실행 시간
    runSequence = new Array(); //실행 순서
    queueLine = new Array(); //대기열 Q 대기시간
    queueLineName = new Array(); //대기열 Q의 프로세스 순서(프로세스 네임);

    $('#inputArea').html("<select style = 'margin: 20px auto 15px auto; display : block'\
    id = 'selectScheduling'>\
      <option>FCFS</option>\
      <option>RR</option>\
      <option>SPN</option>\
      <option>SRTN</option>\
      <option>HRRN</option>\
      <option>LPHRN</option>\
    </select>");

    $('#outputArea').css('display', 'none');

    let i = 0;
    for (; i < cycleNum; i++) {
      $('#inputArea').append("\
      <b class = 'inputTime" + String(i) + "' style = 'font-size: 10px; text-align: left;display: none;'>Process " + String(i) + "</b><br>\
      <input class = 'inputTime" + String(i) + "' id = 'arrivalTime" + String(i) + "' type = 'number' placeholder='Arrival Time' style = 'margin-bottom: 4px;display: none;'><br>\
      <input class = 'inputTime" + String(i) + "' id = 'burstTime" + String(i) + "' type = 'number' placeholder='Burst Time' style = 'margin-bottom: 15px;display: none;'><br>\
      ");
    }
    $('#inputArea').append("<input class = 'inputTime" + String(i) + "' id = 'quantumTime' type = 'number' placeholder='Quantum Time' style = 'margin-bottom: 4px;display: none;'><br>")
    $('#inputArea').append("<input class = 'inputTime" + String(i + 1) + "' id = 'chartSpeed' type = 'number' value = '1000' placeholder='Chart Speed m/s' style = 'margin-bottom: 8px;display: none;'><br>")
    $('#inputArea').append("<input id = 'inputTimeButton' class = 'inputTime" + String(i + 2) + "' type = 'button' value = 'Show me!' style = 'display:none'>");
    $('#outputArea').addClass("inputTime" + String(i + 3));

    let timing = 0;
    for (let i = 0; i <= cycleNum + 3; i++) {
      $(".inputTime" + String(i)).delay(timing).fadeIn(1000);
      timing += 200;
    }
    $('#inputArea').append("<input id = 'processMax' type = 'hidden' value = " + String(cycleNum) + ">");
  })
  //let processes, let arrivalTime, let burstTime, let timeQuantum let waitingTime, let turnAroundTime, let normalizedTurnAroundTime, let intervalRunTime, let runSequence




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
    colorProcess = new Array();
    for (let i = 0; i < processes; i++) {
      colorProcess.push(colorCode[colorOption]);
      colorOption++;
      if (i >= 12) colorOption = 0;
    }
    // console.log("colorProcess : " + colorProcess);

    console.log("process color list ----");
    for (let i = 0; i < processes; i++) {
      console.log("process " + i + " is " + colorProcess[i]);
    }

    for (let cycleNum = 0; cycleNum < intervalRunTime.length; cycleNum++) {
      $('#ganttArea').append("\
          <div id = 'chartBar" + String(cycleNum) + "' style = '\
          " + ((cycleNum == 0) ? "margin-left : 10%;border-top-left-radius: 15px;border-bottom-left-radius: 15px;" : "") + "\
          " + ((cycleNum == intervalRunTime.length - 1) ? "border-top-right-radius: 15px;border-bottom-right-radius: 15px;" : "") + "\
          position : static;\
          width : 0px;\
          height : 19px;\
          float : left;\
          background-color : " + ((Number(runSequence[cycleNum]) == -1) ? colorEmpty : colorProcess[runSequence[cycleNum]]) + ";\
          '></div>");
      // console.log("colorProcess[runSequence[cycleNum]]) : " + colorProcess[runSequence[cycleNum]]);
      // console.log("runSequence[cycleNum] : " + runSequence[cycleNum]);
    }


    // 애니메이션

    // 각 div의 길이를 구함
    let maxBurstTime = 0;
    let maxLength = 400;
    let percentageLength = new Array();

    let totalTime = 0; // 전체 시간을 나타냄.
    for (let i = 0; i < intervalRunTime.length; i++) totalTime += intervalRunTime[i];

    console.log("---------animate----------")
    //비율을 구함
    for (let i = 0; i < intervalRunTime.length; i++) maxBurstTime += Number(intervalRunTime[i]);
    for (let i = 0; i < intervalRunTime.length; i++) {
      percentageLength.push(parseFloat(parseFloat(intervalRunTime[i]) / parseFloat(maxBurstTime)));
    }
    console.log("Number(maxBurstTime) / Number(intervalRunTime.length) : " + Number(maxBurstTime) / Number(intervalRunTime.length));
    $('#ganttArea').append("<br>");
    for (let i = 0; i < totalTime; i++) {
      $('#ganttArea').append("<div style = '\
      width : " + (Number(maxLength) / Number(totalTime)) + "px;\
      height : 21px;\
      " + ((i == totalTime - 1) ? ("") : "border-right : 2px solid white;") + "\
      float : left;\
      position : relative;\
      bottom : 21px;\
      margin-left : " + ((i == 0) ? ("10%") : "") + ";\
      z-index:2;\
      display:inline-block;'\
      </div>");
    }
    //------------------------------------------------
    //시간 및 동작
    //프로세스의 수에 따라서 시간을 변동시키자, 처음 시작할 때 너무 느려
    let timing = 0;
    //chartSpeed
    let timingMaximum = intervalRunTime.length * Number($('#chartSpeed').val()); //바 하나당 시간.
    //바가 끝나는 시간은 여기서 알 수 있음.

    for (let cycleNum = 0; cycleNum < intervalRunTime.length; cycleNum++) {
      setTimeout(function() {
        $('#chartBar' + String(cycleNum)).animate({
          width: (percentageLength[cycleNum] * 400) //길이비 * 최대길이
        }, parseFloat(percentageLength[cycleNum]) * Number(timingMaximum));
        // console.log("percentageLength[cycleNum] : " + String(percentageLength[cycleNum]));
        // console.log("parseFloat(percentageLength[cycleNum]) * timingMaximum : " + parseFloat(percentageLength[cycleNum]) * timingMaximum);
      }, timing);
      timing += parseFloat(percentageLength[cycleNum]) * Number(timingMaximum);
      // console.log("timing : " + timing);
      // console.log("parseFloat(percentageLength[cycleNum]) * timingMaximum : " + parseFloat(percentageLength[cycleNum]) * timingMaximum);
    }

    //프로세스 색상표
    let pro = 0;
    $('#ganttArea').append("<div id = 'colorTable' style = 'text-align : right;'></div>");
    for (let i = 0; i < processes; i++) {
      $('#colorTable').append("\
        <div id = 'processColor" + String(i) + "' class = 'processColor'>\
          <p id = 'processColorName" + String(i) + "' class = 'processColorName'>process " + String(i) + "</p>\
          <div id = 'processColorBox" + String(i) + "' class = 'processColorBox' style = 'background-color: " + colorProcess[i] + ";'> </div>\
        </div>\
      ");
      pro++;
    }
    //대기열 나타내기

    let turn = parseFloat((parseFloat(timingMaximum) / parseFloat(totalTime)));
    $('#ganttArea').append("<div id = 'readyQueueBox'></div>");

    //   console.log("=========QueueLine ==========");
    //   console.log("queueLine.length : "+ queueLine.length);
    //   console.log("queueLine[0].length" + queueLine[0].length);
    //   for (let i = 0; i < queueLine.length; i++) {
    // 	      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    //  }

    let timingQueue = 0;
    for (let time = 0; time < totalTime; time++) {
      setTimeout(function() {
        $('#readyQueueBox').html("");
        for (let qName = 0; qName < queueLine[time].length; qName++) {
          $('#readyQueueBox').append("<div id = 'processQueue" + qName + "' class = 'processQueue' style = 'background-color: " + colorProcess[queueLine[time][qName]] + ";'>\
            <p class = 'inQueueData'>Process " + queueLine[time][qName] + "</p>\
            <p class = 'inQueueData'>Init Burst Time : " + burstTime[queueLine[time][qName]] + "</p>\
            <p class = 'inQueueData'>Final Wating in Queue : 10</p>\
          </div>");
        }
      }, timingQueue);
      timingQueue += turn;
    }
  }

  function showData() {
    let processName = "processName";
    $('#outputArea').html("");
    $('#ganttArea').html("");
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
  //----------------------RR-----------------------
  function rr() {
    let count = 0;
    let i;
    let end_processes = 0;
    let running_count = 0;
    let empty_count = 0;
    let optionProcess;
    let _optionProcess = -1;

    let process_state = false;
    let empty_state = false;
    let in_processesor = false;
    let queue_state = new Array();
    let in_processesor_state = new Array();
    let end_state = new Array();

    let end_count = new Array();
    let remain_burstTime = new Array();
    let p_timeQuantum = new Array();

    let queue = new Array();

    let eRRORSEARCH = 0;
    console.log("RR실행.");
    console.log("error code : " + eRRORSEARCH);
    eRRORSEARCH++;

    for (i = 0; i < processes; i++) {
      remain_burstTime[i] = Number(burstTime[i]);
      p_timeQuantum[i] = 0;
      end_count[i] = 0;
      queue_state[i] = false;
      end_state[i] = false;
      in_processesor_state[i] = false;
    }

    console.log("error code : " + eRRORSEARCH);
    eRRORSEARCH++;

    while (processes != end_processes) { // 프로세스가 모두 작업을 종료해야지 반복문 종료
      // 프로세스가 도착하면 대기열로 이동
      for (i = 0; i < processes; i++) {
        if (_arrivalTime[i] == count) {
          if (queue_state[i] == false) { // 대기열에 들어가지 않았으면(중복입장방지)
            queue.push(i); // 대기열에 들어가고
            queue_state[i] = true; // 들어갔다고 알린다
          }
        }
      }

      console.log("error code 0: " + eRRORSEARCH);
      eRRORSEARCH++;
      console.log("optionProcess is " + optionProcess);
      console.log("_optionProcess is " + _optionProcess);
      console.log("queue.length is " + queue.length);
      console.log("queue[0] is " + queue[0]);
      for (i = 0; i < processes; i++) { // 실행 프로세스를 선택
        if (_arrivalTime[i] <= count && end_state[i] == false) { // 프로세스가 도착해 있고 종료하지 않았다면
          if (queue.length != 0 && queue[0] == i && in_processesor == false) { // 대기열 맨앞에있고 프로세서가 비어있으면
            console.log("in cursor");
            optionProcess = Number(i);
            process_state = true;
          } else if (in_processesor_state[i] == true) { // 작업을 끝마치지 못했을 경우
            optionProcess = Number(i);
            process_state = true;
          } else if (_optionProcess == i) { // 작업을 끝마치지 못했을 경우
            if (queue_state[i] == false) { // 대기열에 들어가지 않았으면(중복입장방지)
              queue.push(i); // 대기열에 들어가고
              queue_state[i] = true; // 들어갔다고 알린다
            }
            if (queue[0] == i) {
              optionProcess = Number(i);
              process_state = true;
            }
          }

        }
      }

      console.log("error code 1: " + eRRORSEARCH);
      eRRORSEARCH++;

      //-----------프로세스 실행---------------------------------------------------------------//
      if (process_state == true) {

        if (empty_count > 0) { //공백 시간이 있으면
          runSequence.push(-1);
          intervalRunTime.push(empty_count); // -1출력
        }

        if (queue.length != 0 && optionProcess == queue[0]) { // 실행 될 프로세스가 대기열에 있었으면
          queue.shift(); // 대기열에서 빼준다
          queue_state[optionProcess] = false; // 대기열에서 나왔다고 알림
        }

        if (in_processesor_state[optionProcess] == false) //프로세스 처음 실행 시
          runSequence.push(optionProcess); // 해당 프로세스를 저장
        console.log("optionProcess is " + optionProcess);;
        remain_burstTime[optionProcess] -= 1; // 작업 1 실행
        _optionProcess = -1;
        p_timeQuantum[optionProcess] += 1; // 타임퀀텀 카운트 1증가
        in_processesor = true; // 프로세스 실행 중임을 알림
        in_processesor_state[optionProcess] = true;
        running_count++;

        if (remain_burstTime[optionProcess] == 0) { // 작업이 끝나면
          console.log("it is error?")
          end_processes++; // 프로세스 하나가 종료                                                               ///에러 발생지점
          end_count[optionProcess] = Number(count); // 0부터 종료시간 측정(후에 TAT계산에 필요)
          in_processesor = false; // 프로세스 종료 했다고 알림
          in_processesor_state[optionProcess] = false;
          end_state[optionProcess] = true; // 프로세스가 모든 작업을 끝냈다고 알림
          _optionProcess = -1;
        } else if (p_timeQuantum[optionProcess] == timeQuantum) { // 타임퀀텀 만큼 작업을 했으면
          p_timeQuantum[optionProcess] = 0; // 타임퀀텀 카운트 초기화

          in_processesor = false; // 프로세스 종료 했다고 알림
          in_processesor_state[optionProcess] = false;
          _optionProcess = Number(optionProcess);
        }
        empty_count = 0;

        if (in_processesor == false) { // 프로세스가 종료되고
          intervalRunTime.push(running_count); // 작업시간 저장
          running_count = 0;
        }
        //-----------프로세스 종료---------------------------------------------------------------//
      } else
        empty_count++;

      queueLine.push();
      queueLine[count] = new Array();
      queueLine[count] = queue.slice();

      count++;
      process_state = false;
      // queueLine.push_back(queue);

      // count++; //타임라인 증가

      //cout << count << endl;
    }

    for (i = 0; i < processes; i++) {
      end_count[i]++;
      turnAroundTime[i] = Number(end_count[i]) - Number(_arrivalTime[i]);
      waitingTime[i] = Number(turnAroundTime[i]) - Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]));
    }
  }
  //----------------------HRRN-----------------------
  function hrrn() {
    console.log("----HRRN Run----");
    let currentTime = 0;
    let exitProcessCnt = 0;
    let runProcess = -1;
    let isInQueue = new Array();
    let isEmptyTime = false;
    let runTimeSelecter = -1;
    let queue = new Array();
    let cloneBurstTime = new Array();
    let responseRatio = new Array();

    for (let i = 0; i < processes; i++) {
      //대기시간 초기화
      waitingTime[i] = 0;

      //BusrtTime 클론 생성.
      cloneBurstTime[i] = Number(burstTime[i]);
      isInQueue[i] = false;
    }

    while (exitProcessCnt < processes) {
      // console.log("time : " + currentTime);
      //지금 시간대에 누군가 왔을 경우 Q 처리.
      for (let optionProcess = 0; optionProcess < processes; optionProcess++) {
        //해당 프로세스 도착시간이 지났으며, 프로세스 실행 시간이 남아있고, Q안에 존재하지 않을 경우.
        if (_arrivalTime[optionProcess] == currentTime && cloneBurstTime[optionProcess] > 0 && !isInQueue[optionProcess]) {
          isInQueue[optionProcess] = true;
          queue.push(optionProcess);
        }
      }
      //Queue의 대기열 상태를 바꿈 ->(WT + BT) / BT 기준.
      //@수정함.
      //생성
      responseRatio = new Array();
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) responseRatio.push(0);
      //대입
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        responseRatio[queueSwaper] = parseFloat(parseFloat(burstTime[queue[queueSwaper]] + parseFloat(waitingTime[queue[queueSwaper]])) / parseFloat(burstTime[queue[queueSwaper]]));
      }

      //스왑
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        for (let queueInSwaper = queueSwaper + 1; queueInSwaper < queue.length; queueInSwaper++) {
          if (responseRatio[queueSwaper] < responseRatio[queueInSwaper]) {
            let dtemp;
            let itemp;
            dtemp = parseFloat(responseRatio[queueSwaper]);
            responseRatio[queueSwaper] = parseFloat(responseRatio[queueInSwaper]);
            responseRatio[queueInSwaper] = parseFloat(dtemp);

            itemp = Number(queue[queueSwaper]);
            queue[queueSwaper] = Number(queue[queueInSwaper]);
            queue[queueInSwaper] = Number(itemp);
          }
        }
      }
      //@여기까지
      // console.log("queue[실행 도중] : ");
      for (let i = 0; i < queue.length; i++) console.log(queue[i]);

      //프로세서 할당
      //대기열에 누군가 있냐 ? 그리고 실행중인 프로세스가 없냐 ?
      if (queue.length > 0 && runProcess == -1) {
        runProcess = queue[0];
        queue.shift();

        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(runProcess);
        isEmptyTime = false;
      }
      //대기열에도 없으면서 실행중이지도 않냐? ==> 공백시간이냐 ?
      else if (queue.length <= 0 && runProcess == -1 && isEmptyTime == false) {
        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(-1);
        isEmptyTime = true;
      }

      // console.log("runProcess[실행 도중] : " + runProcess);
      //실행 처리
      //누군가 실행중이냐?
      if (runProcess != -1) {
        //burstTime이 아직 남았냐?
        if (cloneBurstTime[runProcess] > 0) {
          intervalRunTime[runTimeSelecter]++;
          cloneBurstTime[runProcess]--;
          //burstTime이 더 이상 없냐?
          if (cloneBurstTime[runProcess] <= 0) {
            exitProcessCnt++;
            runProcess = -1;
          }
        }
      }
      //공백시간이냐?
      else if (runProcess == -1 && isEmptyTime == true) {
        intervalRunTime[runTimeSelecter]++;
      }

      //대기열에 남은 프로세스가 존재 하냐?(대기시간)
      for (let waitProcess = 0; waitProcess < queue.length; waitProcess++) {
        waitingTime[queue[waitProcess]]++;
      }
      //Queue저장.

      queueLine.push();
      queueLine[currentTime] = new Array();
      queueLine[currentTime] = queue.slice();

      currentTime++;

    }
    for (let i = 0; i < processes; i++) {
      turnAroundTime[i] = Number(waitingTime[i]) + Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]);
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("Queue Time :" + i);
      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    }
  }
  //----------------------LPHRN-----------------------
  function LPHRN() {
    console.log("----LPHRN Run----");
    let currentTime = 0;
    let exitProcessCnt = 0;
    let runProcess = -1;
    let isInQueue = new Array();
    let isEmptyTime = false;
    let runTimeSelecter = -1;
    let queue = new Array();
    let cloneBurstTime = new Array();
    let responseRatio = new Array();

    for (let i = 0; i < processes; i++) {
      //대기시간 초기화
      waitingTime[i] = 0;

      //BusrtTime 클론 생성.
      cloneBurstTime[i] = Number(burstTime[i]);
      isInQueue[i] = false;
    }

    while (exitProcessCnt < processes) {
      //@수정함
      //프림프션
      if (runProcess != -1 && 0 < queue.length) {
        if (cloneBurstTime[queue[0]] < cloneBurstTime[runProcess]) {
          isInQueue[runProcess] = false;
          queue.unshift(runProcess);
          runProcess = -1;
        }
      }
      // console.log("time : " + currentTime);
      //지금 시간대에 누군가 왔을 경우 Q 처리.
      for (let optionProcess = 0; optionProcess < processes; optionProcess++) {
        //해당 프로세스 도착시간이 지났으며, 프로세스 실행 시간이 남아있고, Q안에 존재하지 않을 경우.
        if (_arrivalTime[optionProcess] == currentTime && cloneBurstTime[optionProcess] > 0 && !isInQueue[optionProcess]) {
          isInQueue[optionProcess] = true;
          queue.push(optionProcess);
        }
      }
      //Queue의 대기열 상태를 바꿈 ->(WT + BT) / BT 기준.
      //@수정함.
      //생성
      responseRatio = new Array();
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) responseRatio.push(0);
      //대입
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        responseRatio[queueSwaper] = parseFloat(parseFloat(burstTime[queue[queueSwaper]] + parseFloat(waitingTime[queue[queueSwaper]])) / parseFloat(burstTime[queue[queueSwaper]]));
      }

      //스왑
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        for (let queueInSwaper = queueSwaper + 1; queueInSwaper < queue.length; queueInSwaper++) {
          if (responseRatio[queueSwaper] < responseRatio[queueInSwaper]) {
            let dtemp;
            let itemp;
            dtemp = parseFloat(responseRatio[queueSwaper]);
            responseRatio[queueSwaper] = parseFloat(responseRatio[queueInSwaper]);
            responseRatio[queueInSwaper] = parseFloat(dtemp);

            itemp = Number(queue[queueSwaper]);
            queue[queueSwaper] = Number(queue[queueInSwaper]);
            queue[queueInSwaper] = Number(itemp);
          }
        }
      }
      //@여기까지
      // console.log("queue[실행 도중] : ");
      for (let i = 0; i < queue.length; i++) console.log(queue[i]);

      //프로세서 할당
      //대기열에 누군가 있냐 ? 그리고 실행중인 프로세스가 없냐 ?
      if (queue.length > 0 && runProcess == -1) {
        runProcess = queue[0];
        queue.shift();

        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(runProcess);
        isEmptyTime = false;
      }
      //대기열에도 없으면서 실행중이지도 않냐? ==> 공백시간이냐 ?
      else if (queue.length <= 0 && runProcess == -1 && isEmptyTime == false) {
        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(-1);
        isEmptyTime = true;
      }

      // console.log("runProcess[실행 도중] : " + runProcess);
      //실행 처리
      //누군가 실행중이냐?
      if (runProcess != -1) {
        //burstTime이 아직 남았냐?
        if (cloneBurstTime[runProcess] > 0) {
          intervalRunTime[runTimeSelecter]++;
          cloneBurstTime[runProcess]--;
          //burstTime이 더 이상 없냐?
          if (cloneBurstTime[runProcess] <= 0) {
            exitProcessCnt++;
            runProcess = -1;
          }
        }
      }
      //공백시간이냐?
      else if (runProcess == -1 && isEmptyTime == true) {
        intervalRunTime[runTimeSelecter]++;
      }

      //대기열에 남은 프로세스가 존재 하냐?(대기시간)
      for (let waitProcess = 0; waitProcess < queue.length; waitProcess++) {
        waitingTime[queue[waitProcess]]++;
      }
      //Queue저장.

      queueLine.push();
      queueLine[currentTime] = new Array();
      queueLine[currentTime] = queue.slice();

      currentTime++;

    }
    for (let i = 0; i < processes; i++) {
      turnAroundTime[i] = Number(waitingTime[i]) + Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]);
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("Queue Time :" + i);
      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    }
  }
  //----------------------SPN-----------------------
  function spn() {
    console.log("----SPN Run----");
    let currentTime = 0;
    let exitProcessCnt = 0;
    let runProcess = -1;
    let isInQueue = new Array();
    let isEmptyTime = false;
    let runTimeSelecter = -1;
    let queue = new Array();
    let cloneBurstTime = new Array();
    let queueBurstTime = new Array();

    for (let i = 0; i < processes; i++) {
      //대기시간 초기화
      waitingTime[i] = 0;

      //BusrtTime 클론 생성.
      cloneBurstTime[i] = Number(burstTime[i]);
      isInQueue[i] = false;
    }

    while (exitProcessCnt < processes) {
      // console.log("time : " + currentTime);
      //지금 시간대에 누군가 왔을 경우 Q 처리.
      for (let optionProcess = 0; optionProcess < processes; optionProcess++) {
        //해당 프로세스 도착시간이 지났으며, 프로세스 실행 시간이 남아있고, Q안에 존재하지 않을 경우.
        if (_arrivalTime[optionProcess] == currentTime && cloneBurstTime[optionProcess] > 0 && !isInQueue[optionProcess]) {
          isInQueue[optionProcess] = true;
          queue.push(optionProcess);
        }
      }
      //Queue의 대기열 상태를 바꿈 ->(WT + BT) / BT 기준.
      //@수정함.
      //생성
      queueBurstTime = new Array();
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) queueBurstTime.push(0);
      //대입
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        queueBurstTime[queueSwaper] = cloneBurstTime[queue[queueSwaper]];
      }

      //스왑
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        for (let queueInSwaper = queueSwaper + 1; queueInSwaper < queue.length; queueInSwaper++) {
          if (queueBurstTime[queueSwaper] > queueBurstTime[queueInSwaper]) {
            let dtemp;
            let itemp;
            dtemp = parseFloat(queueBurstTime[queueSwaper]);
            queueBurstTime[queueSwaper] = parseFloat(queueBurstTime[queueInSwaper]);
            queueBurstTime[queueInSwaper] = parseFloat(dtemp);

            itemp = Number(queue[queueSwaper]);
            queue[queueSwaper] = Number(queue[queueInSwaper]);
            queue[queueInSwaper] = Number(itemp);
          }
        }
      }
      //@여기까지
      // console.log("queue[실행 도중] : ");
      for (let i = 0; i < queue.length; i++) console.log(queue[i]);

      //프로세서 할당
      //대기열에 누군가 있냐 ? 그리고 실행중인 프로세스가 없냐 ?
      if (queue.length > 0 && runProcess == -1) {
        runProcess = queue[0];
        queue.shift();

        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(runProcess);
        isEmptyTime = false;
      }
      //대기열에도 없으면서 실행중이지도 않냐? ==> 공백시간이냐 ?
      else if (queue.length <= 0 && runProcess == -1 && isEmptyTime == false) {
        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(-1);
        isEmptyTime = true;
      }

      // console.log("runProcess[실행 도중] : " + runProcess);
      //실행 처리
      //누군가 실행중이냐?
      if (runProcess != -1) {
        //burstTime이 아직 남았냐?
        if (cloneBurstTime[runProcess] > 0) {
          intervalRunTime[runTimeSelecter]++;
          cloneBurstTime[runProcess]--;
          //burstTime이 더 이상 없냐?
          if (cloneBurstTime[runProcess] <= 0) {
            exitProcessCnt++;
            runProcess = -1;
          }
        }
      }
      //공백시간이냐?
      else if (runProcess == -1 && isEmptyTime == true) {
        intervalRunTime[runTimeSelecter]++;
      }

      //대기열에 남은 프로세스가 존재 하냐?(대기시간)
      for (let waitProcess = 0; waitProcess < queue.length; waitProcess++) {
        waitingTime[queue[waitProcess]]++;
      }
      //Queue저장.

      queueLine.push();
      queueLine[currentTime] = new Array();
      queueLine[currentTime] = queue.slice();

      currentTime++;

    }
    for (let i = 0; i < processes; i++) {
      turnAroundTime[i] = Number(waitingTime[i]) + Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]);
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("Queue Time :" + i);
      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    }
  }
  //----------------------SPTN-----------------------
  function sptn() {
    console.log("----SPTN Run----");
    let currentTime = 0;
    let exitProcessCnt = 0;
    let runProcess = -1;
    let isInQueue = new Array();
    let isEmptyTime = false;
    let runTimeSelecter = -1;
    let queue = new Array();
    let cloneBurstTime = new Array();
    let queueBurstTime = new Array();

    for (let i = 0; i < processes; i++) {
      //대기시간 초기화
      waitingTime[i] = 0;

      //BusrtTime 클론 생성.
      cloneBurstTime[i] = Number(burstTime[i]);
      isInQueue[i] = false;
    }

    while (exitProcessCnt < processes) {
      //@수정함
      //프림프션
      if (runProcess != -1) {
        isInQueue[runProcess] = false;
        queue.unshift(runProcess);
        runProcess = -1;
      }
      // console.log("time : " + currentTime);
      //지금 시간대에 누군가 왔을 경우 Q 처리.
      for (let optionProcess = 0; optionProcess < processes; optionProcess++) {
        //해당 프로세스 도착시간이 지났으며, 프로세스 실행 시간이 남아있고, Q안에 존재하지 않을 경우.
        if (_arrivalTime[optionProcess] == currentTime && cloneBurstTime[optionProcess] > 0 && !isInQueue[optionProcess]) {
          isInQueue[optionProcess] = true;
          queue.push(optionProcess);
        }
      }
      //Queue의 대기열 상태를 바꿈 ->(WT + BT) / BT 기준.
      //@수정함.
      //생성
      queueBurstTime = new Array();
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) queueBurstTime.push(0);
      //대입
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        queueBurstTime[queueSwaper] = cloneBurstTime[queue[queueSwaper]];
      }

      //스왑
      for (let queueSwaper = 0; queueSwaper < queue.length; queueSwaper++) {
        for (let queueInSwaper = queueSwaper + 1; queueInSwaper < queue.length; queueInSwaper++) {
          if (queueBurstTime[queueSwaper] > queueBurstTime[queueInSwaper]) {
            let dtemp;
            let itemp;
            dtemp = parseFloat(queueBurstTime[queueSwaper]);
            queueBurstTime[queueSwaper] = parseFloat(queueBurstTime[queueInSwaper]);
            queueBurstTime[queueInSwaper] = parseFloat(dtemp);

            itemp = Number(queue[queueSwaper]);
            queue[queueSwaper] = Number(queue[queueInSwaper]);
            queue[queueInSwaper] = Number(itemp);
          }
        }
      }
      //@여기까지
      // console.log("queue[실행 도중] : ");
      for (let i = 0; i < queue.length; i++) console.log(queue[i]);

      //프로세서 할당
      //대기열에 누군가 있냐 ? 그리고 실행중인 프로세스가 없냐 ?
      if (queue.length > 0 && runProcess == -1) {
        runProcess = queue[0];
        queue.shift();

        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(runProcess);
        isEmptyTime = false;
      }
      //대기열에도 없으면서 실행중이지도 않냐? ==> 공백시간이냐 ?
      else if (queue.length <= 0 && runProcess == -1 && isEmptyTime == false) {
        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(-1);
        isEmptyTime = true;
      }

      // console.log("runProcess[실행 도중] : " + runProcess);
      //실행 처리
      //누군가 실행중이냐?
      if (runProcess != -1) {
        //burstTime이 아직 남았냐?
        if (cloneBurstTime[runProcess] > 0) {
          intervalRunTime[runTimeSelecter]++;
          cloneBurstTime[runProcess]--;
          //burstTime이 더 이상 없냐?
          if (cloneBurstTime[runProcess] <= 0) {
            exitProcessCnt++;
            runProcess = -1;
          }
        }
      }
      //공백시간이냐?
      else if (runProcess == -1 && isEmptyTime == true) {
        intervalRunTime[runTimeSelecter]++;
      }

      //대기열에 남은 프로세스가 존재 하냐?(대기시간)
      for (let waitProcess = 0; waitProcess < queue.length; waitProcess++) {
        waitingTime[queue[waitProcess]]++;
      }
      //Queue저장.

      queueLine.push();
      queueLine[currentTime] = new Array();
      queueLine[currentTime] = queue.slice();

      currentTime++;

    }
    for (let i = 0; i < processes; i++) {
      turnAroundTime[i] = Number(waitingTime[i]) + Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]);
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("Queue Time :" + i);
      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    }
  }

  //----------------------FCFS-----------------------
  function fcfs() {
    console.log("----FCFS Run----");
    let currentTime = 0;
    let exitProcessCnt = 0;
    let runProcess = -1;
    let isInQueue = new Array();
    let isEmptyTime = false;
    let runTimeSelecter = -1;
    let queue = new Array();
    let cloneBurstTime = new Array();

    for (let i = 0; i < processes; i++) {
      //대기시간 초기화
      waitingTime[i] = 0;

      //BusrtTime 클론 생성.
      cloneBurstTime[i] = Number(burstTime[i]);
      isInQueue[i] = false;
    }

    while (exitProcessCnt < processes) {
      // console.log("time : " + currentTime);
      //지금 시간대에 누군가 왔을 경우 Q 처리.
      for (let optionProcess = 0; optionProcess < processes; optionProcess++) {
        //해당 프로세스 도착시간이 지났으며, 프로세스 실행 시간이 남아있고, Q안에 존재하지 않을 경우.
        if (_arrivalTime[optionProcess] == currentTime && cloneBurstTime[optionProcess] > 0 && !isInQueue[optionProcess]) {
          isInQueue[optionProcess] = true;
          queue.push(optionProcess);
        }
      }
      // console.log("queue[실행 도중] : ");
      for (let i = 0; i < queue.length; i++) console.log(queue[i]);

      //프로세서 할당
      //대기열에 누군가 있냐 ? 그리고 실행중인 프로세스가 없냐 ?
      if (queue.length > 0 && runProcess == -1) {
        runProcess = queue[0];
        queue.shift();

        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(runProcess);
        isEmptyTime = false;
      }
      //대기열에도 없으면서 실행중이지도 않냐? ==> 공백시간이냐 ?
      else if (queue.length <= 0 && runProcess == -1 && isEmptyTime == false) {
        runTimeSelecter++;
        intervalRunTime.push(0);
        runSequence.push(-1);
        isEmptyTime = true;
      }

      // console.log("runProcess[실행 도중] : " + runProcess);
      //실행 처리
      //누군가 실행중이냐?
      if (runProcess != -1) {
        //burstTime이 아직 남았냐?
        if (cloneBurstTime[runProcess] > 0) {
          intervalRunTime[runTimeSelecter]++;
          cloneBurstTime[runProcess]--;
          //burstTime이 더 이상 없냐?
          if (cloneBurstTime[runProcess] <= 0) {
            exitProcessCnt++;
            runProcess = -1;
          }
        }
      }
      //공백시간이냐?
      else if (runProcess == -1 && isEmptyTime == true) {
        intervalRunTime[runTimeSelecter]++;
      }

      //대기열에 남은 프로세스가 존재 하냐?(대기시간)
      for (let waitProcess = 0; waitProcess < queue.length; waitProcess++) {
        waitingTime[queue[waitProcess]]++;
      }
      //Queue저장.

      queueLine.push();
      queueLine[currentTime] = new Array();
      queueLine[currentTime] = queue.slice();

      currentTime++;

    }
    for (let i = 0; i < processes; i++) {
      turnAroundTime[i] = Number(waitingTime[i]) + Number(burstTime[i]);
      normalizedTurnAroundTime[i] = parseFloat(turnAroundTime[i]) / parseFloat(burstTime[i]);
    }
    for (let i = 0; i < queueLine.length; i++) {
      console.log("Queue Time :" + i);
      for (let j = 0; j < queueLine[i].length; j++) console.log(queueLine[i][j]);
    }
  }

  // Show me ! 실행
  $(document).on('click', '#inputTimeButton', function(event) {
    console.log("show me Click.");
    intervalRunTime = new Array(); //실행 시간
    runSequence = new Array(); //실행 순서
    queueLine = new Array(); //대기열 Q 대기시간
    queueLineName = new Array(); //대기열 Q의 프로세스 순서(프로세스 네임);
    //---------------------입력 구간-----------------
    //		입력구간은 수정하지 않으셨으면 합니다 !

    //프로세스 수 지정
    processes = $('#processMax').val();
    // console.log($('#processMax').val());
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
    timeQuantum = $('#quantumTime').val();
    //cout << "Time quantum for RR : ";
    //---------------------출력 구간-----------------
    if (select == "FCFS") fcfs();
    if (select == "RR") rr();
    if (select == "HRRN") hrrn();
    if (select == "SPN") spn();
    if (select == "SRTN") sptn();
    if (select == "LPHRN") LPHRN();

    showData();
    showChart();
  })
}); // end of ready()
