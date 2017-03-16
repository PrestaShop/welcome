<?php
/**
 * 2007-2016 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2015 PrestaShop SA
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

namespace OnBoarding;

class Configuration
{
    private $translator;

    public function __construct($translator)
    {
        $this->translator = $translator;
    }

    public function getConfiguration()
    {
        return array(
            'templates' => array(
                'lost',
                'popup',
                'tooltip',
            ),
            'steps' => array(
                'groups' => array(
                    array(
                        'steps' => array(
                            array(
                                'type' => 'popup',
                                'text' => array(
                                    'type' => 'template',
                                    'src' => 'welcome',
                                ),
                                'options' => array(
                                    'savepoint',
                                    'hideFooter'
                                ),
                                'page' => 'index.php?controller=AdminDashboard',
                            ),
                        ),
                    ),
                    array(
                        'title' => $this->translator->trans('Let\'s create your first product', array(), 'Modules.Welcome.Admin'),
                        'subtitle' => array(
                            '1' => $this->translator->trans('What do you want to tell about it? Think about what your customers want to know.', array(), 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Add clear and attractive information. Don\'t worry, you can edit it later :)', array(), 'Modules.Welcome.Admin'),
                        ),
                        'steps' => array(
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Give your product a catchy name.', array(), 'Modules.Welcome.Admin'),
                                'options' => array(
                                    'savepoint',
                                ),
                                'page' => array(
                                    'index.php/product/new',
                                    'index.php/product/form',
                                ),
                                'selector' => '#form_step1_name_1',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Fill out the essential details in this tab. The other tabs are for more advanced information.', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php/product/form',
                                'selector' => '#tab_step1',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Add one or more pictures so your product looks tempting!', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php/product/form',
                                'selector' => '#product-images-dropzone',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('How much do you want to sell it for?', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php/product/form',
                                'selector' => '.right-column > .row > .col-md-12 > .form-group:nth-child(4) > .row > .col-md-6:first-child > .input-group',
                                'position' => 'left',
                                'action' => array(
                                    'selector' => '#product_form_save_go_to_catalog_btn',
                                    'action' => 'click',
                                ),
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Yay! You just created your first product. Looks good, right?', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php/product/catalog',
                                'selector' => '#product_catalog_list table tr:first-child td:nth-child(3)',
                                'position' => 'left',
                            ),
                        ),
                    ),
                    array(
                        'title' => $this->translator->trans('Give your shop its own identity', array(), 'Modules.Welcome.Admin'),
                        'subtitle' => array(
                            '1' => $this->translator->trans('How do you want your shop to look? What makes it so special?', array(), 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Customize your theme or choose the best design from our theme catalog.', array(), 'Modules.Welcome.Admin'),
                        ),
                        'steps' => array(
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('A good way to start is to add your own logo here!', array(), 'Modules.Welcome.Admin'),
                                'options' => array(
                                    'savepoint',
                                ),
                                'page' => 'index.php?controller=AdminThemes',
                                'selector' => '#js_theme_form_container .tab-content.panel .btn:first-child',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('If you want something really special, have a look at the theme catalog!', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php?controller=AdminThemesCatalog',
                                'selector' => '.addons-theme-one:first-child',
                                'position' => 'right',
                            ),
                        ),
                    ),
                    array(
                        'title' => $this->translator->trans('Get your shop ready for payments', array(), 'Modules.Welcome.Admin'),
                        'subtitle' => array(
                            '1' => $this->translator->trans('How do you want your customers to pay you?', array(), 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Adapt your offer to your market: add the most popular payment methods for your customers!', array(), 'Modules.Welcome.Admin'),
                        ),
                        'steps' => array(
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('The payments methods are already available to your customers.', array(), 'Modules.Welcome.Admin'),
                                'options' => array(
                                    'savepoint',
                                ),
                                'page' => 'index.php?controller=AdminPayment',
                                'selector' => '.modules_list_container_tab:first tr:first-child .text-muted',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('And you can choose to add other payment methods from here!', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php?controller=AdminPayment',
                                'selector' => '.panel:eq(1) table tr:eq(0) td:eq(1)',
                                'position' => 'top',
                            ),
                        ),
                    ),
                    array(
                        'title' => $this->translator->trans('Choose your shipping solutions', array(), 'Modules.Welcome.Admin'),
                        'subtitle' => array(
                            '1' => $this->translator->trans('How do you want to deliver your products?', array(), 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Select the shipping solutions the most likely to suit your customers! Create your own carrier or add a ready-made module.', array(), 'Modules.Welcome.Admin'),
                        ),
                        'steps' => array(
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Here are the shipping methods available on your shop today.', array(), 'Modules.Welcome.Admin'),
                                'options' => array(
                                    'savepoint',
                                ),
                                'page' => 'index.php?controller=AdminCarriers',
                                'selector' => '#table-carrier tr:eq(2) td:eq(3)',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('You can offer more delivery options by setting up additional carriers', array(), 'Modules.Welcome.Admin'),
                                'page' => 'index.php?controller=AdminCarriers',
                                'selector' => '.modules_list_container_tab tr:eq(0) .text-muted',
                                'position' => 'right',
                            ),
                        ),
                    ),
                    array(
                        'title' => $this->translator->trans('Improve your shop with modules', array(), 'Modules.Welcome.Admin'),
                        'subtitle' => array(
                            '1' => $this->translator->trans('Add new features and manage existing ones thanks to modules.', array(), 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('A module can be already installed for you, free to install or paying - browse our selection to see what\'s available!', array(), 'Modules.Welcome.Admin'),
                        ),
                        'steps' => array(
                            array(
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Discover our module selection in the first tab. Manage your modules on the second one and be aware of notifications in the third tab.', array(), 'Modules.Welcome.Admin'),
                                'options' => array(
                                    'savepoint',
                                ),
                                'page' => 'index.php/module/catalog',
                                'selector' => '.page-head-tabs .tab:eq(0)',
                                'position' => 'right',
                            ),
                            array(
                                'type' => 'popup',
                                'text' => array(
                                    'type' => 'template',
                                    'src' => 'end',
                                ),
                                'options' => array(
                                    'savepoint',
                                    'hideFooter',
                                ),
                                'page' => 'index.php/product/catalog',
                            ),
                        ),
                    ),
                ),
            ),
        );
    }
}
