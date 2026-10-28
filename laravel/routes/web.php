<?php

use Illuminate\Support\Facades\Route;

// Explicit static handlers for SEO crawlers
Route::get('/sitemap.xml', function () {
    return response()->file(public_path('sitemap.xml'), [
        'Content-Type' => 'application/xml',
    ]);
});

Route::get('/robots.txt', function () {
    return response()->file(public_path('robots.txt'), [
        'Content-Type' => 'text/plain',
    ]);
});

// 301 Redirect old .html URLs to clean React Router paths
Route::get('/gizlilik-politikasi.html', function () {
    return redirect('/gizlilik-politikasi', 301);
});

Route::get('/kullanim-sartlari.html', function () {
    return redirect('/kullanim-sartlari', 301);
});

// All web routes render the React SPA entry view
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
