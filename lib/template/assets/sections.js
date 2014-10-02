'use strict';

jQuery(function ($) {
	var currentSection = window.location.hash;
	showSection(currentSection);

	$('.zebraNavigation').on('click', '.zebraNavigation-item', function () {
		hideSection(currentSection);
		currentSection = $(this).attr('href');
		showSection(currentSection);
	});

	function showSection (currentSection) {
		$('.zebraNavigation-item[href="' + currentSection + '"]')
			.addClass('is-active');
		$(currentSection).show();
	}

	function hideSection (prevSection) {
		$('.zebraNavigation-item[href="' + prevSection + '"]')
			.removeClass('is-active');
		$(prevSection).hide();
	}
});