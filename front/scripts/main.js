const elems = document.querySelectorAll('.group');

function toggleClass() {
	if (this.classList.contains('active')) {
		this.classList.remove('active');
		return;
	}

	elems.forEach(elem => elem.classList.remove('active'));
	this.classList.add('active');
}

elems.forEach(elem => elem.addEventListener('click', toggleClass));
