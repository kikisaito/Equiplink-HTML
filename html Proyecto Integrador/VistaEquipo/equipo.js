function changeImage(newSrc) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = newSrc;

    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });

    thumbnails.forEach(thumb => {
        if (thumb.src.includes(newSrc.substring(newSrc.lastIndexOf('/')))) {
            thumb.classList.add('active');
        }
    });
}