var dataHelper = {
  dataSheet: SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ScriptData'),
  dataStartRow: 3,

  yearCell: 'H1',
  monthCell: 'I1',

  taskPrefixCol: 'A',
  jiraGroupCol: 'E',

  passwordCellsNotation: "Z1:Z2",

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
    startTimeCol: 'J',

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

  taskProjectRelations: {},

  jiraUser:'',
  jiraPass:'',

  init: function()
  {
    var convertLetters = ['taskPrefixCol', 'jiraGroupCol'];
    convertLetters.forEach(function(convertLetterCol) {
      dataHelper[convertLetterCol] = dataHelper.letterToColumn(dataHelper[convertLetterCol]);
    });

    dataHelper.tasksData = dataHelper.readTasksData();
    //dataHelper.jiraUrls = dataHelper.readJiraUrls();
    dataHelper.getUserPass();

    for (var timeSheetColName in dataHelper.timeSheetCols) {
      dataHelper.timeSheetCols[timeSheetColName] = dataHelper.letterToColumn(dataHelper.timeSheetCols[timeSheetColName]);
    }

    for (var timeSheetColName in dataHelper.bluetelCols) {
      dataHelper.bluetelCols[timeSheetColName] = dataHelper.letterToColumn(dataHelper.bluetelCols[timeSheetColName]);
    }
  },

  getUserPass: function()
  {
    var values = dataHelper.dataSheet.getRange(dataHelper.passwordCellsNotation).getValues();
    dataHelper.jiraUser = values[0][0];
    dataHelper.jiraPass = values[0][1];
  },

  readJiraUrls: function ()
  {
    dataHelper.jiraUrls = {};

    var rowNumber = dataHelper.dataStartRow;
    do {
      var values = dataHelper.dataSheet.getRange(rowNumber, dataHelper.jiraGroupCol, 1, 2).getValues();
      dataHelper.jiraUrls[ values[0][0] ] = values[0][1];
    } while(values[0][0].length);
  },

  readTasksData: function ()
  {
    var rowNumber = dataHelper.dataStartRow;
    for (var i = 0; i < 1000; i++) {
      var values = dataHelper.dataSheet.getRange(rowNumber, dataHelper.taskPrefixCol, 1, 3).getValues();
      if (!values[0][0].length) {
        break;
      }

      dataHelper.taskProjectRelations[values[0][0]] = {projectName: values[0][1], jiraGroup: values[0][2]};
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

  getProjectName: function(taskData)
  {
    if (typeof(taskData) === 'string') {
      taskData = dataHelper.getTaskData(taskData);
    }

    return taskData.projectName;
  },

  getTaskTitle: function(taskData)
  {
    if (typeof(taskData) === 'string') {
      taskData = dataHelper.getTaskData(taskData);
    }

    return taskData.title;
  },

  isJiraTask: function(taskKey)
  {
    if (taskKey.indexOf("-") < 1) {
      return false;
    }

    return true;
  },

  getTaskData: function(taskKey)
  {
    if (this.taskData[taskKey]) {
      return this.taskData[taskKey];
    }

    this.taskData[taskKey] = {
      key: taskKey,
      jiraGroup: 'DEFAULT',
      prefix: '',
      title: '',
      jiraUrl: '',
      projectName: '',
      jiraData: null,
      // TODO implement expiry of local cache
      date: Date.now(),
    };

    if (!dataHelper.isJiraTask(taskKey)) {
      this.taskData[taskKey].jiraGroup = 'DEFAULT';
      this.taskData[taskKey].projectName = dataHelper.taskProjectRelations['DEFAULT'];
      return this.taskData[taskKey];
    }

    this.taskData[taskKey].prefix = taskKey.split("-")[0];
    this.taskData[taskKey].jiraGroup = dataHelper.taskProjectRelations[this.taskData[taskKey].prefix].jiraGroup;
    this.taskData[taskKey].projectName = dataHelper.taskProjectRelations[this.taskData[taskKey].prefix].projectName;
    this.taskData[taskKey].jiraUrl = dataHelper.jiraUrls[this.taskData[taskKey].jiraGroup];

    if (this.taskData[taskKey].jiraUrl) {
      var response = jiraHelper.getTaskInfo(jiraUrl, taskKey);
      this.taskData[taskKey].jiraData = response.fields;
      this.taskData[taskKey].title = response.fields.summary;
    }

    return this.taskData[taskKey];
  },
};

dataHelper.init();
