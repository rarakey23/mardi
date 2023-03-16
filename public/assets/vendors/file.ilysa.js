var app = $(".---file-lyn")
var modal = null;
let target = null;
let content = null;

append_modal();

app.on("click", function () {
  var attr = $(this).attr("target")
  if (typeof attr !== typeof undefined && attr !== false) {
    target = $(`[file-lyn=${attr}]`)
    modal.modal("show")
    $.ajax({
      url: "/file/lyn-modal",
      type: "GET",
      success: function (data) {
        if (data.status) return console.log(data.message);
        content.html(data)
      },
      error: function (data) {
        console.log(data)
      }
    })
  }
})

function append_modal() {
  var html = `<div class="modal fade text-start" id="file-lyn-modal" tabindex="-1" aria-labelledby="myModalLabel1" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="myModalLabel1">Media</h4>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" id="file-lyn-modal-content">
        </div>
      </div>
    </div>
  </div>`;
  $("body").append(html);
  modal = $("#file-lyn-modal");
  content = $("#file-lyn-modal-content");
}

function __setitem___file(name) {
  target.val(name);
  target.trigger("keyup");
  modal.modal("hide");
}