var timeSheet =
{
  // deprecated
  customerCol: 'M',
  taskNumberColumn: 'E',
  taskInfoColumn: 'K',
  descriptionCol: 'E',

  // The description to add to JIRA will be read from this col.
  // The month related will be read from here.
  monthCell: 'G1',
  // The year will be read from here.
  yearCell: 'H1',

  // The following variables are the columns for the script to read the data from
  // *Required: this will be the col for the pure task number
  taskCol: 'M',
  // *Required: the value of this coumn will be sent to jira as time spent
  timeCol: 'I',
  // *Required: this will be the col of the date of the current month and year.
  // TODO: it will take the current month and current year yet, so it's no good for logging previous months!! Needs to be improved
  dateCol: 'L',
  // Optional: this will be col of start time. if you empty out it will skip it and use 9:00 AM GMT as a start time for every task
  startCol: 'J',

  // Recommended: this will be col of the output of this logger
  loggedCol: 'O',

  // The following variables required for the bluetel timesheet template.
  // This is needed for the Bluetel timesheet template. This is going to be filled by the script.
  bltDateCol: 'A',
  bltProjectCol: 'B',
  bltTaskCol: 'C',
  bltTimeSpentCol: 'D',
  bltDetailsCol: 'E',
  bltOverTimeCol: 'F',

  onCustomEdit: function ()
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
    // converting column letters to column numbers
    var taskCol = dataHelper.letterToColumn(this.taskCol);
    var timeCol = dataHelper.letterToColumn(this.timeCol);
    var dateCol = dataHelper.letterToColumn(this.dateCol);
    var loggedCol = dataHelper.letterToColumn(this.loggedCol);
    var startCol = dataHelper.letterToColumn(this.startCol);

    var bltTaskCol = dataHelper.letterToColumn(this.bltTaskCol);
    var bltDetailsCol = dataHelper.letterToColumn(this.bltDetailsCol);
    var projectCol = dataHelper.letterToColumn(this.bltProjectCol);

    if (dateCol === false || timeCol === false || taskCol === false) {
      if (loggedCol !== false ) {
        SpreadsheetApp.getActiveSheet().getActiveRange().getCell(i, loggedCol).setValue("One of the required fields wasn't set");
      } else {
        return;
      }
    }

    // Loop through the selected rows
    var sheet = SpreadsheetApp.getActiveSheet();
    var range = sheet.getActiveRange();
    var rowCount = range.getNumRows();

    for (var i = 1; i <= rowCount; i++) {
      // grab cell to be used for writing and reading
      var loggedCell = range.getCell(i, loggedCol);
      var taskCell = range.getCell(i, taskCol);

      // gather data
      var issueKey = taskCell.getValue();
      if (issueKey.indexOf("-") < 0) {
        if (issueKey.length > 0 ) {
          range.getCell(i, projectCol).setValue("Bluetel");
        }
        continue;
      }
      var title = taskTitle(issueKey);
      var project = getProject(issueKey);

      loggedCell.setValue("LOGGING "+issueKey);

      // fill bluetel templatefields




      // fill task info

      range.getCell(i, bltTaskCol).setValue(issueKey+' '+title);

      range.getCell(i, projectCol).setValue(project);

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
      var timeCell = range.getCell(i, timeCol);
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
        var start = range.getCell(i, startCol).getValue();
      }
      if (start.length == 3 || start.length == 4 ) {
        var startMinute = start.substr(-2);
        var startHour = start.substr(0,start.length-2);
        start = 'T'+startHour+':'+startMinute+':00.000+0000';
      } else {
        start = 'T09:00:00.000+0000';
      }

      // get the starting date
      var month = sheet.getRange(this.monthCell).getCell(1, 1).getValue();
      var year = sheet.getRange(this.yearCell).getCell(1, 1).getValue();
      var date = parseInt( range.getCell(i, dateCol).getValue() );
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
    }
  },

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
