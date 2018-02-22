var obj = { test: true, nest1: { val: 3 } };

function objDFS(obj, label){

  console.log('currently in ', obj);

  if (obj.hasOwnProperty(label)) {
    console.log("Found : ", obj[label]);
    return obj[label];
  }

  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++){
    console.log('selecting key ' + keys[i], obj);
    var temp = obj;
    obj = objDFS(temp[keys[i]], label);
    if (obj && obj.hasOwnProperty(label)) return obj[label];
  }

  console.log("nothing found in ", obj);
}

objDFS(obj, 'val');
