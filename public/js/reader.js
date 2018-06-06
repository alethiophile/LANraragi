//functions to navigate in reader with the keyboard.
//also handles the thumbnail archive explorer.

function moveSomething(e) {

	switch (e.keyCode) {
		case 37:
			// left key pressed
			goLeft();
			break;
		case 32:
			// spacebar pressed
			goToPage(currentPage + 1);
			break;
		case 39:
			// right key pressed
			goRight();
			break;
		case 17:
			// Ctrl key pressed
			openOverlay();
			break;
	}
}

document.addEventListener("keyup", moveSomething, false);

function toastHelpReader() {

	$.toast().reset('all');

	$.toast({
		heading: 'Navigation Help',
		text: 'You can navigate between pages using : <ul><li> The arrow icons</li> <li>Your keyboard arrows</li> <li> Touching the left/right side of the image.</li></ul><br> To return to the archive index, touch the arrow pointing down.<br> Pressing CTRL will bring up the pages overlay.',
		hideAfter: false,
		position: 'top-left',
		icon: 'info'
	});
}

function updateMetadata() {

	//remove overlay
	loaded = true;
	$("#i3").removeClass("loading");

	filename = $("#img").get(0).src.replace(/^.*[\\\/]/, '');
	w = $("#img").get(0).naturalWidth;
	h = $("#img").get(0).naturalHeight;
	size = "UNKNOWN"

	//HEAD request to get filesize
	xhr = $.ajax({
		url: pages.pages[currentPage],
		type: 'HEAD',
		success: function () {
			size = parseInt(xhr.getResponseHeader('Content-Length') / 1024, 10);
		}
	}).done(function (data) {

		metadataString = filename + " :: " + w + " x " + h + " :: " + size + " KB";

		$('.file-info').each(function () {
			$(this).html(metadataString);
		});

		updateImageMap();
	});

}

function updateImageMap() {

	//update imagemap with the w/h parameters we obtained
	mapWidth = $("#img").get(0).width / 2;
	mapHeight = $("#img").get(0).height;
	$("#leftmap").attr("coords", "0,0," + mapWidth + "," + mapHeight);
	$("#rightmap").attr("coords", (mapWidth + 1) + ",0," + w + "," + mapHeight);
}

function goToPage(page) {

	if (page < 0)
		currentPage = 0;
	else if (page >= pageNumber)
		currentPage = pageNumber - 1;
	else currentPage = page;

	//update image
	$("#img").attr("src", pages.pages[currentPage]);

	//scale to view simply forces image height at 90vh (90% of viewport height)
	if (localStorage.scaletoview === 'true')
		$("#img").attr("style", "height: 90vh;");
	else
		$("#img").attr("style", "");

	//update numbers
	$('.current-page').each(function () {
		$(this).html(parseInt(currentPage) + 1);
	});

	$('.max-page').each(function () {
		$(this).html(pageNumber);
	});

	loaded = false;

	//display overlay if it takes too long to load a page
	setTimeout(function () {
		if (!loaded)
			$("#i3").addClass("loading");
	}, 500);

	//update full image link
	$("#imgLink").attr("href", pages.pages[currentPage]);

	//store page number in localStorage
	localStorage.setItem(id + "-reader", currentPage);

	//scroll to top
	$('body').scrollTop(0);
}

function goLeft() {
	if (localStorage.readorder === 'true')
		goToPage(currentPage + 1);
	else
		goToPage(currentPage - 1);
}

function goRight() {
	if (localStorage.readorder === 'true')
		goToPage(currentPage - 1);
	else
		goToPage(currentPage + 1);
}

function goFirst() {
	if (localStorage.readorder === 'true')
		goToPage(pageNumber - 1);
	else
		goToPage(0);
}

function goLast() {
	if (localStorage.readorder === 'true')
		goToPage(0);
	else
		goToPage(pageNumber - 1);
}

function initArchivePageOverlay() {

	//For each link in the pages array, craft a div and jam it in the overlay.
	for (index = 0; index < pages.pages.length; ++index) {

		thumbnail = "<div class='id3' style='display: inline-block; cursor: pointer'>" +
			"<a onclick='goToPage(" + index + "); closeOverlay()'>" +
			"<span class='page-number'>Page " + (index + 1) + "</span>" +
			"<img src='" + pages.pages[index] + "' /></a>" +
			"</div>";

		$("#archivePagesOverlay").append(thumbnail);

	}
}

function initSettingsOverlay() {

	if (localStorage.readorder === 'true')
		$("#readorder").prop("checked", true);

	if (localStorage.doublepage === 'true')
		$("#doublepage").prop("checked", true);

	if (localStorage.scaletoview === 'true')
		$("#scaletoview").prop("checked", true);

}

function saveSettings() {
	localStorage.readorder = $("#readorder").prop("checked");
	localStorage.doublepage = $("#doublepage").prop("checked");
	localStorage.scaletoview = $("#scaletoview").prop("checked");

	closeOverlay();
	goToPage(currentPage);
}

function openOverlay() {
	$('#overlay-shade').fadeTo(150, 0.6, function () {
		$('#archivePagesOverlay').css('display', 'block');
	});
}

function openSettings() {
	$('#overlay-shade').fadeTo(150, 0.6, function () {
		$('#settingsOverlay').css('display', 'block');
	});
}

function closeOverlay() {
	$('#overlay-shade').fadeOut(300);
	$('.base-overlay').css('display', 'none');
}

function confirmThumbnailReset(id) {

	if (confirm("Are you sure you want to regenerate the thumbnail for this archive?")) {

		$.get("./reader?id=" + id + "&reload_thumbnail=1").done(function () {
			$.toast({
				showHideTransition: 'slide',
				position: 'top-left',
				loader: false,
				heading: 'Thumbnail Regenerated.',
				icon: 'success'
			});
		});
	}
}