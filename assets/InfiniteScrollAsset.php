<?php

namespace mgcode\infinite\assets;

use yii\web\AssetBundle;

class InfiniteScrollAsset extends AssetBundle
{
    public $sourcePath = '@mgcode/infinite/assets/files';
    public $js = [
        'infinite-scroll.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
        'mgcode\assets\HistoryJsAsset',
    ];
}