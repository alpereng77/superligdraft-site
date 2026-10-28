import React from 'react';

export default function PosterModal() {
    const handleDownload = () => {
        if (typeof window.downloadPoster === 'function') {
            window.downloadPoster();
        }
    };

    const handleShare = () => {
        if (typeof window.sharePoster === 'function') {
            window.sharePoster();
        }
    };

    const handleClose = () => {
        if (typeof window.closePosterModal === 'function') {
            window.closePosterModal();
        } else {
            const modal = document.getElementById('poster-modal');
            if (modal) modal.classList.add('hidden');
        }
    };

    const handleSaveMuseum = () => {
        if (window.Museum && typeof window.Museum.saveCurrentSquad === 'function') {
            const isChamp = window.activePosterIsChampion || false;
            const success = window.Museum.saveCurrentSquad(isChamp);
            const btn = document.getElementById('btn-save-museum');
            if (btn && success) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Müzeye Eklendi';
                btn.disabled = true;
            }
        }
    };

    return (
        <div id="poster-modal" className="poster-modal hidden">
            <div className="poster-modal-inner">
                <div className="poster-scroll-area">
                    <div id="poster-canvas" className="poster-canvas"></div>
                </div>
                <div className="poster-modal-actions">
                    <button
                        id="btn-save-museum"
                        type="button"
                        className="btn btn-gold cursor-pointer"
                        onClick={handleSaveMuseum}
                    >
                        <i className="fa-solid fa-building-columns"></i> Müzeye Kaydet
                    </button>
                    <button
                        id="btn-download-poster"
                        type="button"
                        className="btn btn-primary cursor-pointer"
                        onClick={handleDownload}
                    >
                        <i className="fa-solid fa-download"></i> İndir
                    </button>
                    <button
                        id="btn-share-poster"
                        type="button"
                        className="btn btn-secondary cursor-pointer"
                        onClick={handleShare}
                    >
                        <i className="fa-solid fa-share-nodes"></i> Paylaş
                    </button>
                    <button
                        id="btn-close-poster"
                        type="button"
                        className="btn btn-black cursor-pointer"
                        onClick={handleClose}
                    >
                        <i className="fa-solid fa-xmark"></i> Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
