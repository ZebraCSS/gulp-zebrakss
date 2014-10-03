'use strict';

jQuery(function ($) {
	var currentSection = getHash();
	showSection(currentSection);

	$(window).on('hashchange', function () {
		hideSection(currentSection);
		currentSection = getHash();
		showSection(currentSection);
	});

	function getHash () {
		return (window.location.hash || '#overview');
	}

	function showSection (currentSection) {
		$('.zebraNavigation-item[href="' + currentSection + '"]')
			.addClass('is-active');
		$(currentSection + '-content')
			.addClass('is-active');
	}

	function hideSection (prevSection) {
		$('.zebraNavigation-item[href="' + prevSection + '"]')
			.removeClass('is-active');
		$(prevSection + '-content')
			.removeClass('is-active');
	}
});