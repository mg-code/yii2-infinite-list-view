<?php

namespace mgcode\infinite;

use Yii;
use yii\base\InvalidConfigException;
use yii\helpers\Html;
use yii\base\Widget;
use yii\data\Pagination;

class Pager extends Widget
{
    /**
     * @var Pagination the pagination object that this pager is associated with.
     * You must set this property in order to make LinkPager work.
     */
    public $pagination;

    /**
     * @var array HTML attributes for the pager container tag.
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $optionsNext = ['class' => 'pagination next'];

    /**
     * @var array HTML attributes for the pager container tag.
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $optionsPrev = ['class' => 'pagination prev'];

    /**
     * @var array HTML attributes for the link in a pager container tag.
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $linkOptions = ['class' => 'btn btn-default'];

    /** @inheritdoc */
    public function init()
    {
        if ($this->pagination === null) {
            throw new InvalidConfigException('The "pagination" property must be set.');
        }
    }

    /**
     * Renders previous page button.
     * @return string
     */
    public function runTop()
    {
        $currentPage = $this->pagination->getPage();

        if ($currentPage > 0) {
            $page = $currentPage - 1;
            $button = Html::a(Yii::t('mgcode/infinite', 'Load previous'), $this->pagination->createUrl($page), $this->linkOptions);
            echo Html::tag('div', $button, $this->optionsPrev);
        }
    }

    /**
     * Executes the widget.
     * This overrides the parent implementation by displaying the generated page buttons.
     */
    public function run()
    {
        echo $this->renderPageButtons();
    }

    /**
     * Renders next page button.
     * @return string the rendering result
     */
    protected function renderPageButtons()
    {
        $pageCount = $this->pagination->getPageCount();
        $currentPage = $this->pagination->getPage();

        if ($currentPage < $pageCount - 1) {
            if (($page = $currentPage + 1) >= $pageCount - 1) {
                $page = $pageCount - 1;
            }
            $button = Html::a(Yii::t('mgcode/infinite', 'Load more'), $this->pagination->createUrl($page), $this->linkOptions);
            return Html::tag('div', $button, $this->optionsNext);
        }
        return '';
    }
}