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
  timeSheet.getTaskInfo();
}
