(function($) {

  // url     : http://localhost:8001/list_buckets
  // type    : GET
  // params  : NONE
  // returns : JSON Array containing objects
  //
  // Example Response:
  // [{"Name":"ebucket","CreationDate":"2015-07-01T16:31:54.000Z"},...]

  var getBuckets = function(callback) {
    $.ajax({
      url: "/list_buckets",
      type: "GET",
      success: function(data, res) {
        console.log("data:" + data);
        console.log("res:" + res);
        callback(data);
      },
      error: function(a,b,c) {
        console.log(a,b,c);
      }
    });
  }

  // url     : http://localhost:8001/:bucket/list_objects
  // type    : GET
  // params  : bucket name
  // returns : JSON Array containing objects
  //
  // Example Response:
  // [{"Key":"edge.mp4","LastModified":"1999-01-01T15:56:54.000Z","Size":6222,...}, ...]

  var listObjects = function(bucket, callback) {
    $.ajax({
      url: bucket + "/list_objects",
      type: "GET",
      success: function(data, res) {
        console.log("data:" + data);
        console.log("res:" + res);
        callback(data);
      },
      error: function(a,b,c) {
        console.log(a,b,c);
      }
    });
  }

  // url     : http://localhost:8001/:bucket/new_bucket
  // type    : POST
  // params  : new bucket name
  // returns : JSON Object
  //
  // Example Response:
  // {"Body":"We have created a new bucket called testbucket at Thu Jul 10 2015 14:16:16 GMT-0700 (PDT)"}

  var newBucket = function(bucket) {
    $.ajax({
      url: bucket + "/new_bucket",
      type: "POST",
      success: function(data, res) {
        alert("Successfully created new bucket");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
      }
    });
  }

  // url     : http://localhost:8001/:bucket/
  // type    : DELETE
  // params  : bucket name
  // returns : JSON Object
  //
  // Example Response: HTTP STATUS CODE

  var deleteBucket = function(bucket) {
    $.ajax({
      url: bucket,
      type: "DELETE",
      success: function(data, res) {
        console.log("data:" + data);
        console.log("res:" + res);
        alert("Successfully Deleted Bucket!");
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $(".delete-bucket-response").html(errorThrown);
      }
    });
  }

  // url     : http://localhost:8001/add_object/
  // type    : POST
  // params  : multipart/form | [FileObject][BucketName]
  // returns : JSON Object
  //
  // Example Response: HTTP STATUS CODE

  var createObject = function(data) {
    $.ajax({
      url: '/add_object',
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'POST',
      success: function(data, res) {
        alert("Object created")
      },
      error: function(a,b,c) {
        $(".upload-response").html("error");
      }
    });
  }

  // url     : http://localhost:8001/:bucket/:object_key
  // type    : DELETE
  // params  : bucket name, object key
  // returns : JSON Object
  //
  // Example Response: HTTP STATUS CODE

  var deleteObject = function(data) {
    $.ajax({
      url: data.bucket + '/' + data.key,
      data: data,
      cache: false,
      contentType: false,
      processData: false,
      type: 'DELETE',
      success: function(data, res) {
        $(".upload-response").html(data);
      },
      error: function(a,b,c) {
        $(".upload-response").html("error");
      }
    });
  }

  // ***************************
  // API Example: Event Handlers
  // ***************************

  $("#getBucketList").on("click", function(e) {
    var callback = function(data) {
      var jsonList = JSON.parse(data);
      var table = $(".bucket-list");
      table.empty();
      $(jsonList).each(function(index, el) {
        var tableRow = "<tr><td>"+el.Name+"</td><td>"+el.CreationDate+"</td></tr>"
        table.append(tableRow);
        console.log(el);
      });
    };
    getBuckets(callback);
  }); // get bucket list

  $("#listObjects").on("click", function(e) {
    var bucketName = $("input[name=bucket-name]").val();
    var callback = function(data) {
      var jsonList = JSON.parse(data);
      var table = $(".objects-list");
      table.empty();
      $(jsonList).each(function(index, el) {
        var tableRow = "<tr><td>"+el.Key+"</td><td>"+el.LastModified+"</td></tr>";
        table.append(tableRow);
      });
    };
    if(!bucketName) {
      alert("Needs bucket name!");
      return false;
    }
    listObjects(bucketName ,callback);
  }); // list objects

  $("#createBucket").on("click", function(e) {
    var bucketName = $("input[name=new-bucket-name]").val();

    if(!bucketName) {
      console.log("needs bucket name!");
      return false;
    }
    newBucket(bucketName);
  }); // create new bucket

  $("#deleteBucket").on("click", function(e) {
    var bucketName = $("input[name=delete-bucket-name]").val();

    if(!bucketName) {
      console.log("needs bucket name!");
      return false;
    }
    deleteBucket(bucketName);
  }); // delete bucket

  $("#chooseBucketCreate").on("click", function(e) {
    var callback = function(data) {
      data = JSON.parse(data);
      var selectBox = $("#bucketSelectCreate");
      // clear select box
      selectBox.empty();
      data.forEach(function(item, index){
        $("<option />", {value: item["Name"], text: item["Name"]}).appendTo(selectBox);
      });
    };
    getBuckets(callback);
  }); // populate bucket select box

  $("#chooseBucketDelete").on("click", function(e) {
    var callback = function(data) {
      data = JSON.parse(data);
      var selectBox = $("#bucketSelectDelete");
      // clear select box
      selectBox.empty();
      data.forEach(function(item, index){
        $("<option />", {value: item["Name"], text: item["Name"]}).appendTo(selectBox);
      });
    };
    getBuckets(callback);
  }); // populate bucket select box

  $("#fileSubmit").on("click", function(e) {
    var data = new FormData();
    var file = $("input[type=file]")[0].files[0]

    data.append("new_file", file);
    data.append("bucket", $("#bucketSelectCreate").val());
    createObject(data);
    return false;
  }); // Create new object in bucket

  $("#fileDelete").on("click", function(e) {
    var bucket = $("#bucketSelectDelete").val();
    var key = $("input[name=key]").val();

    deleteObject({"key": key, "bucket": bucket});
    return false;
  }); // Delete new object in bucket

  $(document).ready(function() {
    $("#chooseBucketCreate").click();
    $("#chooseBucketDelete").click();
  });

})(jQuery)
