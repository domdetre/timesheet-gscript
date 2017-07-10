var dataHelper = {
  dataSheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ScriptData'),
  dataStartRow: 3,

  taskPrefixCol: 'A',
  taskProjectCol: 'B',
  taskJiraGroupCol: 'C',

  jiraGroupCol: 'E',
  jiraUrlCol: 'F',

  jiraUrls: {},

  timeSheetCols: {
    // deprecated
    customerCol: 'M',
    taskNumberColumn: 'E',
    taskInfoColumn: 'K',
    descriptionCol: 'E',

    // The following variables are the columns for the script to read the data from
    // *Required: this will be the col for the pure task number
    taskCol: 'M',
    // *Required: the value of this coumn will be sent to jira as time spent
    decimalHourCol: 'I',
    // *Required: this will be the col of the date of the current month and year.
    // TODO: it will take the current month and current year yet, so it's no good for logging previous months!! Needs to be improved
    dateCol: 'L',
    // Optional: this will be col of start time. if you empty out it will skip it and use 9:00 AM GMT as a start time for every task
    startCol: 'J',

    // Recommended: this will be col of the output of this logger
    logCol: 'O',
  },

  // The following variables required for the bluetel timesheet template.
  // This is needed for the Bluetel timesheet template. This is going to be filled by the script.
  bluetelCols: {
    dateCol: 'A',
    projectCol: 'B',
    taskCol: 'C',
    timeSpentCol: 'D',
    detailsCol: 'E',
    overTimeCol: 'F',
  },

  init: function() {
    var convertLetters = ['taskPrefixCol', 'taskProjectCol', 'taskJiraGroupCol', 'jiraGroupCol', 'jiraUrlCol'];
    for (var convertLetterCol in convertLetters) {
      dataHelper[convertLetterCol] = dataHelper.letterToColumn(dataHelper[convertLetterCol]);
    }

    dataHelper.tasksData = dataHelper.readTasksData();
    dataHelper.jiraUrls = dataHelper.readJiraUrls();
    dataHelper.getUserPass();

    for (var timeSheetColName in dataHelper.timeSheetCols) {
      dataHelper.timeSheetCols[timeSheetColName] = dataHelper.letterToColumn(dataHelper.timeSheetCols[timeSheetColName]);
    }

    for (var timeSheetColName in dataHelper.bluetelCols) {
      dataHelper.bluetelCols[timeSheetColName] = dataHelper.letterToColumn(dataHelper.bluetelCols[timeSheetColName]);
    }
  },

  getUserPass() {
    var values = dataHelper.dataSheet.getRange("Z1:Z2").getValues();
    dataHelper.jiraUser = values[0][0];
    dataHelper.jiraPass = values[0][1];
  }

  getTaskData: function (taskNumber) {

  },

  readJiraUrls: function () {
    var jiraUrls = {};
    var numCols = Math.abs(dataHelper.jiraGroupCol - dataHelper.jiraUrlCol);
    var startColNumber = Math.min(dataHelper.jiraGroupCol, dataHelper.jiraUrlCol);
    var jiraGroupColIndex = dataHelper.jiraGroupCol - startColNumber;
    var jiraUrlColIndex = dataHelper.jiraUrlCol - startColNumber;

    var jiraDataRange = dataHelper.dataSheet.getRange(dataHelper.dataStartRow, dataHelper.jiraGroupCol, 1, numCols);
    var jiraDataValues = jiraDataRange.getValues();
    for (var row in jiraDataValues) {
      jiraUrls[ jiraDataValues[jiraGroupColIndex] ] = jiraDataValues[jiraUrlColIndex]
    }
  },

  readTasksData: function () {
    var jiraDataRange = dataHelper.dataSheet.getRange(dataHelper.dataStartRow, dataHelper.taskPrefixCol, 1, numCols);
  }

  columnToLetter: function(column)
  {
    var temp;
    var letter = '';

    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }

    return letter;
  },

  letterToColumn: function(letter)
  {
    if (letter.length == 0) {
      return false;
    }

    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++)
    {
      column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }

    return column;
  },


}

dataHelper.init();
