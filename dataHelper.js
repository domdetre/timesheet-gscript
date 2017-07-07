var dataHelper = {
  dataSheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ScriptData'),
  dataStartRow: 3,

  taskPrefixCol: 'A',
  taskProjectCol: 'B',
  taskJiraGroupCol: 'C',

  jiraGroupCol: 'E',
  jiraUrlCol: 'F',

  jiraUrls: {},

  init: function() {
    var convertLetters = ['taskPrefixCol', 'taskProjectCol', 'taskJiraGroupCol', 'jiraGroupCol', 'jiraUrlCol'];
    for (var convertLetterCol in convertLetters) {
      dataHelper[convertLetterCol] = dataHelper.letterToColumn(dataHelper[convertLetterCol]);
    }

    dataHelper.jiraUrls = dataHelper.readJiraUrls();
    dataHelpre.getUserPass();
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
