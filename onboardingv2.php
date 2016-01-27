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
 * @copyright 2007-2016 PrestaShop SA
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

if (!defined('_PS_VERSION_'))
    exit;

require_once __DIR__.'/vendor/autoload.php';

use \OnBoarding\OnBoarding;

/**
 * OnBoarding module entry class.
 */
class Onboardingv2 extends Module
{
    /**
     * @var OnBoarding
     */
    private $onBoarding;

    /**
     * Module's constructor.
     */
    public function __construct()
    {
        $this->name = 'onboardingv2';
        $this->version = '1.0.0';
        $this->author = 'PrestaShop';

        parent::__construct();

        $this->displayName = $this->l('OnBoarding v2');
        $this->description = $this->l('Help the user to create his first product.');
        $this->ps_versions_compliancy = [
            'min' => '1.7.0.0',
            'max' => _PS_VERSION_,
        ];

        $this->onBoarding = new OnBoarding('en'); // TODO: Get the language of the shop

        if (Tools::getIsset('resetonboarding')) {
            $this->onBoarding->setShutDown(false);
            $this->onBoarding->setCurrentStep(0);
        }
    }

    /**
     * Module installation.
     *
     * @return bool Success of the installation
     */
    public function install()
    {
        return parent::install()
            && $this->registerHook('displayAdminNavBarBeforeEnd')
            && $this->registerHook('displayAdminAfterHeader')
            && $this->registerHook('displayBackOfficeHeader');
    }

    /**
     * Uninstall the module.
     *
     * @return bool Success of the uninstallation
     */
    public function uninstall()
    {
        return parent::uninstall();
    }

    /**
     * Hook called when the backoffice header is displayed.
     */
    public function hookDisplayBackOfficeHeader()
    {
        if (!$this->onBoarding->isFinished()) {
            $this->context->controller->addCSS($this->_path.'style/css/onboarding.css', 'all');
            $this->context->controller->addJS($this->_path.'lib/onboarding.js', 'all');
        }
    }

    /**
     * Hook called after the header of the backoffice.
     */
    public function hookDisplayAdminAfterHeader()
    {
        if (!$this->onBoarding->isFinished()) {
            $this->onBoarding->showModuleContent();
        }
    }

    /**
     * Hook called before the end of the nav bar.
     */
    public function hookDisplayAdminNavBarBeforeEnd()
    {
        if (!$this->onBoarding->isFinished()) {
            $this->onBoarding->showModuleContentForNavBar();
        }
    }
}
