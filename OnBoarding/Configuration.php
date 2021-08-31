<?php
/**
 * 2007-2020 PrestaShop and Contributors
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2020 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

namespace OnBoarding;

use Hook;
use Module;
use PrestaShopBundle\Service\Routing\Router;

class Configuration
{
    /**
     * Module Dependency
     */
    const FAKE_ID = 123456789;

    const HOOK_CONFIGURATION = 'welcome_configuration';

    const STEP_DASHBOARD = 'dashboard';
    const STEP_PRODUCT = 'product';
    const STEP_THEME = 'theme';
    const STEP_PAYMENT = 'payment';
    const STEP_SHIPPING = 'shipping';

    private $translator;

    public function __construct($translator)
    {
        $this->translator = $translator;
    }

    public function getConfiguration(Router $router)
    {
        $contextLink = \Context::getContext()->link;

        $productFormUrlPattern = $this->generateSfBaseUrl(
            $router,
            'admin_product_form',
            ['id' => static::FAKE_ID]
        );

        $data = [
            'templates' => [
                'lost',
                'popup',
                'tooltip',
            ],
            'steps' => [
                'groups' => [
                    [
                        'name' => static::STEP_DASHBOARD,
                        'steps' => [
                            [
                                'type' => 'popup',
                                'text' => [
                                    'type' => 'template',
                                    'src' => 'welcome',
                                ],
                                'options' => [
                                    'savepoint',
                                    'hideFooter',
                                ],
                                'page' => $contextLink->getAdminLink('AdminDashboard'),
                            ],
                        ],
                    ],
                    [
                        'name' => static::STEP_PRODUCT,
                        'title' => $this->translator->trans('Let\'s create your first product', [], 'Modules.Welcome.Admin'),
                        'subtitle' => [
                            '1' => $this->translator->trans('What do you want to tell about it? Think about what your customers want to know.', [], 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Add clear and attractive information. Don\'t worry, you can edit it later :)', [], 'Modules.Welcome.Admin'),
                        ],
                        'steps' => [
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Give your product a catchy name.', [], 'Modules.Welcome.Admin'),
                                'options' => [
                                    'savepoint',
                                ],
                                'page' => [
                                    $router->generate('admin_product_new'),
                                    $productFormUrlPattern,
                                ],
                                'selector' => '#form_step1_name_1',
                                'position' => 'right',
                            ],
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Fill out the essential details in this tab. The other tabs are for more advanced information.', [], 'Modules.Welcome.Admin'),
                                'page' => $productFormUrlPattern,
                                'selector' => '#tab_step1',
                                'position' => 'right',
                            ],
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Add one or more pictures so your product looks tempting!', [], 'Modules.Welcome.Admin'),
                                'page' => $productFormUrlPattern,
                                'selector' => '#product-images-dropzone',
                                'position' => 'right',
                            ],
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('How much do you want to sell it for?', [], 'Modules.Welcome.Admin'),
                                'page' => $productFormUrlPattern,
                                'selector' => '.right-column > .row > .col-md-12 > .form-group:nth-child(4) > .row > .col-md-6:first-child > .input-group',
                                'position' => 'left',
                                'action' => [
                                    'selector' => '#product_form_save_go_to_catalog_btn',
                                    'action' => 'click',
                                ],
                            ],
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Yay! You just created your first product. Looks good, right?', [], 'Modules.Welcome.Admin'),
                                'page' => $this->generateSfBaseUrl($router, 'admin_product_catalog'),
                                'selector' => '#product_catalog_list table tr:first-child td:nth-child(3)',
                                'position' => 'left',
                            ],
                        ],
                    ],
                    [
                        'name' => static::STEP_THEME,
                        'title' => $this->translator->trans('Give your shop its own identity', [], 'Modules.Welcome.Admin'),
                        'subtitle' => [
                            '1' => $this->translator->trans('How do you want your shop to look? What makes it so special?', [], 'Modules.Welcome.Admin'),
                            '2' => $this->translator->trans('Customize your theme or choose the best design from our theme catalog.', [], 'Modules.Welcome.Admin'),
                        ],
                        'steps' => [
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('A good way to start is to add your own logo here!', [], 'Modules.Welcome.Admin'),
                                'options' => [
                                    'savepoint',
                                ],
                                'page' => $contextLink->getAdminLink('AdminThemes'),
                                'selector' => '#form_shop_logos_header_logo, #form_header_logo',
                                'position' => 'right',
                            ],
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('If you want something really special, have a look at the theme catalog!', [], 'Modules.Welcome.Admin'),
                                'page' => $contextLink->getAdminLink('AdminThemesCatalog'),
                                'selector' => '.addons-theme-one:first-child',
                                'position' => 'right',
                            ],
                        ],
                    ],
                    [
                        'name' => static::STEP_PAYMENT,
                        'title' => $this->translator->trans('Get your shop ready for payments', [], 'Modules.Welcome.Admin'),
                        'subtitle' => [
                            '1' => $this->translator->trans('How do you want your customers to pay you?', [], 'Modules.Welcome.Admin'),
                        ],
                        'steps' => [
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('These payment methods are already available to your customers.', [], 'Modules.Welcome.Admin'),
                                'options' => [
                                    'savepoint',
                                ],
                                'page' => $contextLink->getAdminLink('AdminPayment'),
                                'selector' => '.modules_list_container_tab:first tr:first-child .text-muted, .card:eq(0) .text-muted:eq(0)',
                                'position' => 'right',
                            ],
                        ],
                    ],
                    [
                        'name' => static::STEP_SHIPPING,
                        'title' => $this->translator->trans('Choose your shipping solutions', [], 'Modules.Welcome.Admin'),
                        'subtitle' => [
                            '1' => $this->translator->trans('How do you want to deliver your products?', [], 'Modules.Welcome.Admin'),
                        ],
                        'steps' => [
                            [
                                'type' => 'tooltip',
                                'text' => $this->translator->trans('Here are the shipping methods available on your shop today.', [], 'Modules.Welcome.Admin'),
                                'options' => [
                                    'savepoint',
                                ],
                                'page' => $contextLink->getAdminLink('AdminCarriers'),
                                'selector' => '#table-carrier tr:eq(2) td:eq(3)',
                                'position' => 'right',
                            ],
                            [
                                'type' => 'popup',
                                'text' => [
                                    'type' => 'template',
                                    'src' => 'end',
                                ],
                                'options' => [
                                    'savepoint',
                                    'hideFooter',
                                ],
                                'page' => $contextLink->getAdminLink('AdminDashboard'),
                            ],
                        ],
                    ],
                ],
            ],
        ];

        Hook::exec(static::HOOK_CONFIGURATION, ['data' => &$data]);

        return $data;
    }

    /**
     * generate url pattern to recognize the route as the current step url
     * here we replace the route specific parameters with wildcard to allow regexp matching
     *
     * @param \PrestaShopBundle\Service\Routing\Router $router
     * @param string $controller
     * @param array $fakeParameters
     *
     * @return mixed|string
     */
    protected function generateSfBaseUrl(Router $router, string $controller, $fakeParameters = [])
    {
        $url = $router->getGenerator()->generate($controller, $fakeParameters);
        $url = substr($url, strlen(basename(__PS_BASE_URI__)) + 1);
        $url = str_replace('/' . basename(_PS_ADMIN_DIR_) . '/', '', $url);

        $url = str_replace(array_values($fakeParameters), '.+', $url);

        return $url;
    }
}
