var timeSheet =
{
  activeSheet: null,
  activeRange: null,
  activeRow: {
    number: 0,
    cells: {bluetel:{}, timesheet:{}},
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
      return;
    }

    timeSheet.setActiveLogMessage('LOGGING: ' + data.task.key + ' JiraGroup: ' + data.task.jiraGroup);

    // if the hourspent is invalid then stop
    if (!data.hoursSpent || isNaN(data.hoursSpent)) {
      timeSheet.setActiveLogMessage('timeSpent is ZERO, stopping.');
      return;
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
  },

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
  },

  getDataOfCells: function()
  {
    var data = {
      task: dataHelper.getTaskData(timeSheet.activeRow.cells.timesheet.task.getValue()),
      description: timeSheet.activeRow.cells.timesheet.description.getValue(),
    };

    data.yearNumber = timeSheet.activeSheet.getRange(dataHelper.yearCell).getValues()[0][0];
    data.monthNumber = timeSheet.activeSheet.getRange(dataHelper.monthCell).getValues()[0][0];

    data.dateNumber = parseInt(timeSheet.activeRow.cells.timesheet.date.getValue());
    data.monthNumber = parseInt(data.monthNumber);
    data.yearNumber = parseInt(data.yearNumber);

    data.hoursSpent = parseFloat(timeSheet.activeRow.cells.timesheet.decimalHour.getValue()).toFixed(2);
    data.minutesSpent = hoursSpent * 60;
    data.secondsSpent = minutesSpent * 60;

    data.startTime = ('0000' + timeSheet.activeRow.cells.timesheet.startTime).substr(-4);
    data.startHour = data.startTime.substr(0,2);
    data.startMinute = data.startTime.substr(-2);

    data.dateString = data.dateNumber + '/' + data.monthNumber + '/' + data.yearNumber;
    data.dateTime = new Date(
      data.yearNumber + '-' + data.monthNumber + '-' + data.dateNumber + ' ' + data.startHour + ':' + data.startMinute
    );
    data.dateTimeIso = data.dateTime.toISOString();

    timeSheet.activeRow.data = data;
    return data;
  },
};
