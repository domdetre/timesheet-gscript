function createSpreadsheetEditTrigger() {
  //var ui = SpreadsheetApp.getUi();
  //var response = ui.prompt('Getting to know you', 'May I know your name?', ui.ButtonSet.YES_NO);

  var ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('getTaskInfo')
      .forSpreadsheet(ss)
      .onEdit()
      .create();
}

function getTaskInfo() {
  timeSheet.onCustomEdit();
}

function fillTaskRow() {
  timeSheet.fillCustomerProjectInfo();
}

function logPacktTime() {
  timeSheet.logPacktTime();
}

function taskTitle(taskNumber) {
  if (taskNumber.indexOf("-") < 0) {
    return;
  }

  taskInfo = jiraHelper.getIssueByKey(taskNumber);
  return taskInfo.fields.summary;
}

function getCustomer(taskNumber) {
  if (taskNumber.indexOf("-") < 0) {
    return "Bluetel";
  }

  var task = taskNumber.split("-");
  var taskType = task[0];
  var taskInfo = timeSheet.taskTypes[taskType];
  if (taskInfo) {
    return taskInfo[0];
  }

  return;
}

function getProject(taskNumber) {
  return dataQuery.getProject(taskNumber);
}

function monthName(monthnum) {
  return "-,January,February,March,April,May,June,July,August,September,October,November,December".split(',')[monthnum];
}
function dayName(daynum) {
  return "-,Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(',')[daynum];
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu= ui.createMenu('Jira Helper')

  menu.addItem('Log Selected', 'logPacktTime').addToUi();
  menu.addItem('Install', 'createSpreadsheetEditTrigger').addToUi();
}

/*function onEdit(e){
  timeSheet.onEdit(e);
}*/