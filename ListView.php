<?php

namespace mgcode\infinite;
use mgcode\helpers\ArrayHelper;

class ListView extends \yii\widgets\ListView
{
    /** 
     * @var bool Whether to enable infinite scroll plugin.
     */
    public $enableClientScript = true;

    /** 
     * @var int|null Stop autoloading after certain amount of auto loads.
     */
    public $stopAfter;

    /** 
     * @var bool Whether to load page on first view.
     */
    public $autoloadOnFirst = true;

    /**
     * @var string the layout that determines how different sections of the list view should be organized.
     * The following tokens will be replaced with the corresponding section contents:
     *
     * - `{pagerTop}`: the pager top. See [[renderPagerTop()]].
     * - `{items}`: the list items. See [[renderItems()]].
     * - `{pager}`: the pager. See [[renderPager()]].
     */
    public $layout = "{pagerTop}\n<div class=\"items\">\n{items}\n</div>\n{pager}";

    /**
     * @var Pager
     */
    private $_pagerInstance;

    public function init()
    {
        parent::init();
        if(isset($this->options['class']) && $this->options['class']) {
            $this->options['class'] .= ' infinity-pagination';
        } else {
            $this->options['class'] = 'infinity-pagination';
        }

        if(!$this->autoloadOnFirst) {
            $this->autoloadOnFirst = (int) \Yii::$app->request->get('page', 1) !== 1;
        }

        $this->options = array_merge($this->options, [
            'data-stop-after' => (int) $this->stopAfter,
            'data-autoload' => (int) $this->autoloadOnFirst
        ]);

        if($this->registerClientScript) {
            InfiniteScrollAsset::register($this->getView());
            $this->getView()->registerJs("$('.infinity-pagination').infiniteScroll();");
        }
    }

    /**
     * Renders a section of the specified name.
     * If the named section is not supported, false will be returned.
     *
     * @param string $name the section name, e.g., `{summary}`, `{items}`.
     * @return string|boolean the rendering result of the section, or false if the named section is not supported.
     */
    public function renderSection($name)
    {
        if ($name == '{pagerTop}') {
            return $this->renderPagerTop();
        }

        return parent::renderSection($name);
    }

    /**
     * Renders the pager.
     *
     * @return string the rendering result
     */
    public function renderPagerTop()
    {
        $pager = $this->getPagerInstance();

        ob_start();
        ob_implicit_flush(false);
        $out = $pager ? $this->getPagerInstance()->runTop() : '';
        return ob_get_clean() . $out;
    }

    /**
     * Renders the pager.
     *
     * @return string the rendering result
     */
    public function renderPager()
    {
        $pager = $this->getPagerInstance();

        ob_start();
        ob_implicit_flush(false);
        $out = $pager ? $this->getPagerInstance()->run() : '';
        return ob_get_clean() . $out;
    }

    /**
     * @return Pager
     */
    public function getPagerInstance()
    {
        if ($this->_pagerInstance !== null) {
            return $this->_pagerInstance;
        }

        $pagination = $this->dataProvider->getPagination();
        if ($pagination === false || $this->dataProvider->getCount() <= 0) {
            return null;
        }
        /* @var $class Pager */
        $pager = $this->pager;
        $class = ArrayHelper::remove($pager, 'class', Pager::className());
        $pager['class'] = $class;
        $pager['pagination'] = $pagination;
        $pager['view'] = $this->getView();

        $this->_pagerInstance = \Yii::createObject($pager);
        return $this->_pagerInstance;
    }
}