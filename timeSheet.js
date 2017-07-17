var timeSheet =
{
  getTaskInfo: function ()
  {
    this.sheet = SpreadsheetApp.getActiveSheet();

    this.activeRange = this.sheet.getActiveRange();

    this.column = this.activeRange.getColumn();
    this.columnLetter = dataHelper.columnToLetter(this.column);

    this.row = this.activeRange.getRow();
    this.cell = this.activeRange.getCell(1,1);

    if (this.taskNumberColumn === this.columnLetter) {
      this.updateDateCell(this.activeRange);
      this.processTaskCell(this.activeRange);
    }
  },

  onEdit: function (event)
  {
    this.event = event;
    var range = event.range;

    this.column = range.getColumn();
    this.columnLetter = dataHelper.columnToLetter(this.column);

    this.row = range.getRow();
    this.cell = range.getCell(1,1);

    if (this.taskNumberColumn === this.columnLetter) {
      this.updateDateCell(range);
      this.processTaskCell(range);
    }
  },

  updateDateCell: function(range)
  {
    this.sheet = SpreadsheetApp.getActiveSheet();
    this.dateCell = this.sheet.getRange(this.dateCol+this.row).getCell(1,1);
    if (this.dateCell.getValue().length == 0) {
      var d = new Date();
      this.dateCell.setValue(d.getDate());CDP
    }
  },

  processTaskCell: function (range)
  {
    this.task = this.cell.getValue();

    if (this.task.indexOf("-") < 0) {
      range.setNote('Not a task: '+this.task);
      return;
    }

    var task = this.task.split("-");
    if (task.length != 2) {
      range.setNote('Not a task: '+this.task);
      return;
    }

    this.taskType = task[0];
    this.taskNumber = task[1];
    this.taskInfo = this.taskTypes[this.taskType];

    this.sheet = SpreadsheetApp.getActiveSheet();
    this.rowRange = this.sheet.getRange('A'+this.row+':X'+this.row);

    range.setNote('Processing task: '+this.task);

    if (!this.taskInfo) {
      range.setNote('task type not found '+this.task);
      return;
    }

    this.taskIsPackt = this.taskInfo[0].indexOf('Packt') === 0;
    range.setNote('Processing task 6');

    if (!this.taskIsPackt) {
      range.setNote('Not Packt task '+this.task);
      return;
    }

    range.setNote('Processing task 7 '+this.task);

    var taskInfo = this.getIssueByKey(this.task);
    range.setNote('Processing task 8: '+this.task);
    range.setNote('Processing task 9: '+taskInfo);
    this.sheet.getRange(this.taskInfoColumn+this.row).getCell().setValue(this.task+" "+taskInfo.fields.summary);
  },


  fillCustomerProjectInfo: function ()
  {
    this.taskKey = this.event.range.getValue().toUpperCase();
    var taskType = this.taskKey.split('-')[0];
    this.row = range.getRow();

    taskInfo = this.taskTypes[taskType];

    if (taskInfo) {
      this.sheet.getRange(this.customerCol+this.row).setValue(taskInfo[0]);
      this.sheet.getRange(this.projectCol+this.row).setValue(taskInfo[1]);
    }

    SpreadsheetApp.getActiveSheet().getActiveRange().getCell(i, loggedCol).setValue(taskInfo[0]);
  },

  fillTaskInfo: function ()
  {
    this.sheet.getRange(this.taskInfoColumn+this.row).setValue("getting task info ...");

    this.taskKey = this.event.range.getValue().toUpperCase();
    this.row = range.getRow();

    // non packt tasks
    if (!timeSheet.isTaskPackt(this.taskKey)) {
      return;
    }
    // PACKT tasks
    else {
      this.taskInfo = jiraHelper.searchIssueByKey(this.taskKey);
      this.sheet.getRange(this.taskInfoColumn+this.row).setValue(this.taskInfo.summary);
      this.sheet.getRange(this.taskNumberColumn+this.row).setValue(this.taskKey);
    }
  },

  /**
   * Works out if task is a Packt task
   * @param issueKey {string} issue key, task number, what have you
   * @return {boolean} will return true if task is a Packt task
   */
  isTaskPackt: function(issueKey)
  {
    if (issueKey.substring(0,4) !== "PPUB"
     && issueKey.substring(0,4) !== "PLIB"
     && issueKey.substring(0,2) !== "DM"
     && issueKey.substring(0,3) !== 'CDP'
     && issueKey.substring(0,4) !== 'ISIS'
     && issueKey.substring(0,2) !== 'PU') {
      return false;
    }
    return true;
  },

  /**
   * Called by menu item trigger.
   * Gets the task names, date and time spent for a selection and sends it
   * to JIRA using the jiraHelper method, addWorklog()
   */
  logPacktTime: function()
  {
    if (dateCol === false || timeCol === false || taskCol === false) {
      if (loggedCol !== false ) {
        SpreadsheetApp.getActiveSheet().getActiveRange().getCell(i, loggedCol).setValue("One of the required fields wasn't set");
      } else {
        return;
      }
    }

    // Loop through the selected rows
    timeSheet.activeSheet = SpreadsheetApp.getActiveSheet();
    timeSheet.activeRange = sheet.getActiveRange();
    var rowCount = range.getNumRows();

    for (var i = 1; i <= rowCount; i++) {
      timeSheet.logTimeOfRow(i);
    }
  },

  logTimeOfRow: function(rowNumber)
  {
    // grab cells to be used for writing and reading
    var cells = timeSheet.getCellsOfRowOfRange(rowNumber);

    // gather data
    var data = timeSheet.getDataOfCells(cells);


    if (issueKey.indexOf("-") < 0) {
      if (issueKey.length > 0 ) {
        cells.bluetel.project.setValue("Bluetel");
      }
      continue;
    }

    loggedCell.setValue("LOGGING " + issueKey);

    // fill bluetel templatefields

    cells.bluetel.date.setValue( daydate );
    cells.bluetel.project.setValue( project );
    cells.bluetel.task.setValue( issueKey + ' ' + title );
    cells.bluetel.time.setValue( hoursSpent );




    // fill task info


    var taskBranch = jiraHelper.processTaskBranch(issueKey, customer);
    if (!taskBranch) {
      loggedCell.setValue("Couldn't determine the task");
      continue;
    }
    if (taskBranch != 'packt') {
      loggedCell.setValue("NOT Packt task");
      continue;
    }

    // get time spent
    var timeCell = timeSheet.activeRange.getCell(rowNumber, timeCol);
    var timeSpent = parseFloat(timeCell.getValue()).toFixed(2);
    if (timeSpent == 0 || isNaN(timeSpent)) {
      loggedCell.setValue("No time spent "+timeSpent);
      continue;
    }
    loggedCell.setValue("LOGGING: issue "+issueKey+"; time spent "+timeSpent);
    var secondsSpent = timeSpent * 3600;
    loggedCell.setValue("LOGGING: issue "+issueKey+"; time spent "+timeSpent+"; seconds spent "+secondsSpent);

    // get the starting time
    var start = '';
    if (startCol !== false) {
      var start = timeSheet.activeRange.getCell(rowNumber, startCol).getValue();
    }
    if (start.length == 3 || start.length == 4 ) {
      var startMinute = start.substr(-2);
      var startHour = start.substr(0,start.length-2);
      start = 'T'+startHour+':'+startMinute+':00.000+0000';
    } else {
      start = 'T09:00:00.000+0000';
    }

    // get the starting date
    var month = timeSheet.activeSheet.getRange(this.monthCell).getCell(1, 1).getValue();
    var year = timeSheet.activeSheet.getRange(this.yearCell).getCell(1, 1).getValue();
    var date = parseInt( timeSheet.activeRange.getCell(rowNumber, dateCol).getValue() );
    if (date == 0 || isNaN(date)) {
      loggedCell.setValue("Invalid date value "+date);
      continue;
    }
    date = ( '0' + (date) ).substr(-2) ;
    var ISOdate = year + "-" + month + "-" + date + start;
    loggedCell.setValue("LOGGING: issue "+issueKey+"; time spent "+timeSpent+"; seconds spent "+secondsSpent+"; Date "+ISOdate);

    // send the data to jira
    var response = jiraHelper.addWorklog(issueKey, ISOdate, secondsSpent);
    if (response === true) {
      loggedCell.setValue("LOGGED");
    } else {
      loggedCell.setValue("ERROR: "+response+"; \n issue "+issueKey+"; time spent "+timeSpent+"; seconds spent "+secondsSpent+"; Date "+datetime);
    }
  },

  getCellsOfRowOfRange: function(rowNumber)
  {
    var cells = {bluetel:{}, timesheet:{}};

    for (var colName in dataHelper.timeSheetCols) {
      cells.timesheet[colName.replace('Col', '')] = timeSheet.activeRange.getCell(rowNumber, dataHelper.timeSheetCols[colName]);
    }

    for (var colName in dataHelper.bluetelCols) {
      cells.bluetel[colName.replace('Col', '')] = timeSheet.activeRange.getCell(rowNumber, dataHelper.bluetelCols[colName]);
    }

    return cells;
  }

  getDataOfCells: function(cells)
  {
    var data = {};

    data.taskKey = cells.timesheet.task.getValue();
    data.taskTitle = taskTitle(data.taskKey);
    data.projectName = dataHelper.getProjectName(data.taskKey);

    data.dateNumber = cells.timesheet.date.getValue();
    data.monthNumber = dataHelper.monthNumber;
    data.yearNumber = dataHelper.yearNumber;

    data.taskData = dataHelper.getTaskData();

    data.hoursSpent = cells.timesheet.decimalHour.getValue();
    data.minutesSpent = hoursSpent * 60;
    data.secondsSpent = minutesSpent * 60;

    data.startTime = ('0000' + cells.timesheet.startTime).substr(-4);
    data.startHour = data.startTime.substr(0,2);
    data.startMinute = data.startTime.substr(-2);

    return data;
  }


  // =========================================

  jiraRequest: function(resource, data, request) {
    if (!this.taskBranch) {
      return false;
    }

    if(this.username.length < 1) {
      return false;
    }

    var postData = JSON.stringify(data);
    var postHeaders = {
      "Authorization" : "Basic " + Utilities.base64Encode(this.username + ':' + this.password),
      "Content-Type":"application/json"
    }

    var params = {
      "method": request,
      "headers": postHeaders,
      "payload": postData,
    };

    var url = this.url[this.taskBranch]+"/rest/api/latest/" + resource;
    var httpResponse = UrlFetchApp.fetch(url, params);
    return httpResponse.getResponseCode();
  },

  searchIssueByKey: function(issueKey) {
    var jqlData = {
      "jql": 'issueKey = ' + issueKey,
    };

    var response = this.jiraRequest('search', jqlData, 'post');
    return response.issues[0].fields;
  },

  getIssueByKey: function(issueKey) {
    this.event.range.setNote('Processing task B1 '+this.task);
    var url = this.url['bluetel'];
    if (this.taskIsPackt) {
      url = this.url['packt'];
    }

    this.event.range.setNote('Processing task B2 '+url);

    url += "/rest/api/2/issue/" + issueKey;
    var postHeaders = {
      "Authorization" : "Basic " + Utilities.base64Encode(this.username + ':' + this.password),
      "Content-Type":"application/json"
    };

    this.event.range.setNote('Processing task B3 '+this.username);

    var response = UrlFetchApp.fetch(url, {method:"GET",headers:postHeaders});

    this.event.range.setNote('Processing task B4 '+this.username);
    return JSON.parse(response);
  },

};
