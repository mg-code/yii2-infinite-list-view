<?php

namespace mgcode\infinite\assets;

use yii\web\AssetBundle;

class InfiniteListViewAsset extends AssetBundle
{
    public $sourcePath = '@mgcode/infinite/assets/files';
    public $js = [
        'infinite-list-view.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
        'mgcode\assets\HistoryJsAsset',
        'mgcode\helpers\HelpersAsset',
    ];
}