var timeSheet =
{
  activeShett: null,
  activeRange: null,
  activeRow: {
    number: 0,
    cells: {bluetel:{}, timesheet:{}},
  },

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

    for (var rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
      timeSheet.activeRow.number = rowNumber;
      timeSheet.logTimeOfActiveRow();
    }
  },

  logTimeOfActiveRow: function()
  {
    // grab cells to be used for writing and reading
    var cells = timeSheet.getCellsOfActiveRow();

    // gather data
    var data = timeSheet.getDataOfCells();

    // fill bluetel templatefields
    cells.bluetel.date.setValue(data.dateString);
    cells.bluetel.project.setValue(data.task.projectName);
    cells.bluetel.task.setValue(data.task.key + ' ' + data.task.title);
    cells.bluetel.time.setValue(data.hoursSpent);

    // in case it's the default entry, stop processing
    if (data.projectName === dataHelper.taskProjectRelations['DEFAULT']) {
      continue;
    }

    timeSheet.setActiveLogMessage('LOGGING: ' + data.task.key + ' JiraGroup: ' + data.task.jiraGroup);

    // if the hourspent is invalid then stop
    if (!data.hoursSpent || isNaN(data.hoursSpent)) {
      timeSheet.setActiveLogMessage('timeSpent is ZERO, stopping.');
      continue;
    }

    if (!data.dateNumber || !data.monthNumber || !data.yearNumber || isNaN(data.dateNumber) || isNaN(data.monthNumber) || isNaN(data.yearNumber)) {
      timeSheet.setActiveLogMessage('invalid date value, stopping.');
    }

    timeSheet.setActiveLogMessage('hours spent: ' + data.hoursSpent + ' seconds spent: ' + data.secondsSpent);
    timeSheet.setActiveLogMessage('ISOdate: ' + data.dateTimeIso);

    // send the data to jira
    var response = jiraHelper.addWorklog(data.task.jiraUrl, data.task.key, data.dateTimeIso, data.secondsSpent, data.description);
    if (response === true) {
      timeSheet.setActiveLogMessage("LOGGED");
    } else {
      timeSheet.setActiveLogMessage("ERROR: " + response);
    }
  },

  setActiveLogMessage: function(message)
  {
    var currentMessage = timeSheet.activeRow.cells.log.getValue();
    if (currentMessage) {
      currentMessage += '\n';
    }

    timeSheet.activeRow.cells.log.setValue(currentMessage + message);
  }

  getCellsOfActiveRow: function()
  {
    for (var colName in dataHelper.timeSheetCols) {
      timeSheet.activeRow.cells.timesheet[colName.replace('Col', '')] =
        timeSheet.activeRange.getCell(timeSheet.activeRow.number, dataHelper.timeSheetCols[colName]);
    }

    for (var colName in dataHelper.bluetelCols) {
      timeSheet.activeRow.cells.bluetel[colName.replace('Col', '')] =
        timeSheet.activeRange.getCell(timeSheet.activeRow.number, dataHelper.bluetelCols[colName]);
    }

    return timeSheet.activeRow.cells;
  }

  getDataOfCells: function()
  {
    var data = {
      task: dataHelper.getTaskData(timeSheet.activeRow.cells.timesheet.task.getValue()),
      description: timeSheet.activeRow.cells.timesheet.description.getValue(),
    };

    data.dateNumber = parseInt(timeSheet.activeRow.cells.timesheet.date.getValue());
    data.monthNumber = parseInt(dataHelper.monthNumber);
    data.yearNumber = parseInt(dataHelper.yearNumber);

    data.hoursSpent = parseFloat(timeSheet.activeRow.cells.timesheet.decimalHour.getValue()).toFixed(2);
    data.minutesSpent = hoursSpent * 60;
    data.secondsSpent = minutesSpent * 60;

    data.startTime = ('0000' + timeSheet.activeRow.cells.timesheet.startTime).substr(-4);
    data.startHour = data.startTime.substr(0,2);
    data.startMinute = data.startTime.substr(-2);

    data.dateString = data.dateNumber + '/' + data.monthNumber + '/' = data.yearNumber;
    data.dateTime = new Date(
      data.yearNumber + '-' + data.monthNumber + '-' + data.dateNumber + ' ' + data.startHour + ':' + data.startMinute
    );
    data.dateTimeIso = data.dateTime.toISOString();

    timeSheet.activeRow.data = data;
    return data;
  }
};
