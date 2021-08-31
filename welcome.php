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
if (!defined('_PS_VERSION_')) {
    exit;
}

$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
}

use OnBoarding\OnBoarding;
use PrestaShop\PrestaShop\Adapter\SymfonyContainer;

/**
 * OnBoarding module entry class.
 */
class Welcome extends Module
{
    const CLASS_NAME = 'AdminWelcome';

    /**
     * @var string Name of the module running on PS 1.6.x. Used for data migration.
     */
    const PS_16_EQUIVALENT_MODULE = 'onboarding';

    /**
     * @var OnBoarding
     */
    private $onBoarding;

    /**
     * @var bool
     */
    private $displayHeader = true;

    /**
     * Module's constructor.
     */
    public function __construct()
    {
        $this->name = 'welcome';
        $this->version = '6.0.7';
        $this->author = 'PrestaShop';

        parent::__construct();

        $this->displayName = $this->trans('Welcome', [], 'Modules.Welcome.Admin');
        $this->description = $this->trans('Sell your first product quicker than you would have expected with our nice onboarding process.', [], 'Modules.Welcome.Admin');
        $this->ps_versions_compliancy = [
            'min' => '1.7.6.0',
            'max' => _PS_VERSION_,
        ];

        // If the symfony container is not available or if we are not in the admin directory
        // this constructor will fail.
        // This can happen during the upgrade process
        if (null == SymfonyContainer::getInstance() || !defined('_PS_ADMIN_DIR_')) {
            return;
        }

        if (Module::isInstalled($this->name)) {
            $smartyDisplayHeader = $this->smarty->getTemplateVars('display_header');
            $this->displayHeader = (null !== $smartyDisplayHeader && is_bool($smartyDisplayHeader)) ?
                $smartyDisplayHeader :
                true;

            $this->onBoarding = new OnBoarding(
                $this->getTranslator(),
                $this->smarty,
                $this,
                SymfonyContainer::getInstance()->get('router')
            );

            if (Tools::getIsset('resetonboarding')) {
                $this->onBoarding->setShutDown(false);
                $this->onBoarding->setCurrentStep(0);
            }
        }
    }

    /**
     * Module installation.
     *
     * @return bool Success of the installation
     */
    public function install()
    {
        $this->uninstallPrestaShop16Module();

        return parent::install()
            && $this->installTab()
            && $this->registerHook('displayAdminNavBarBeforeEnd')
            && $this->registerHook('displayAdminAfterHeader')
            && $this->registerHook('displayBackOfficeHeader');
    }

    public function installTab()
    {
        $tab = new Tab();
        $tab->active = true;
        $tab->class_name = static::CLASS_NAME;
        $tab->name = [];
        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'Welcome';
        }
        $tab->module = $this->name;

        return $tab->add();
    }

    public function uninstallTab()
    {
        $id_tab = (int) Tab::getIdFromClassName(static::CLASS_NAME);
        if ($id_tab) {
            $tab = new Tab($id_tab);

            return $tab->delete();
        } else {
            return false;
        }
    }

    /**
     * Uninstall the module.
     *
     * @return bool Success of the uninstallation
     */
    public function uninstall()
    {
        $this->onBoarding->setCurrentStep(0);
        $this->onBoarding->setShutDown(false);
        $this->uninstallTab();

        return parent::uninstall();
    }

    /**
     * Migrate data from 1.6 equivalent module (if applicable), then uninstall
     */
    public function uninstallPrestaShop16Module()
    {
        if (!Module::isInstalled(self::PS_16_EQUIVALENT_MODULE)) {
            return false;
        }
        $oldModule = Module::getInstanceByName(self::PS_16_EQUIVALENT_MODULE);
        if ($oldModule) {
            // This closure calls the parent class to prevent data to be erased
            // It allows the new module to be configured without migration
            $parentUninstallClosure = function () {
                return parent::uninstall();
            };
            $parentUninstallClosure = $parentUninstallClosure->bindTo($oldModule, get_class($oldModule));
            $parentUninstallClosure();
        }

        return true;
    }

    /**
     * Hook called when the backoffice header is displayed.
     */
    public function hookDisplayBackOfficeHeader()
    {
        if (!$this->onBoarding->isFinished()) {
            $this->context->controller->addCSS($this->_path . 'public/module.css', 'all');
            $this->context->controller->addJS($this->_path . 'public/module.js');
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

    /**
     * Execute an API like action for the OnBoarding.
     *
     * @param string $action Action to perform
     * @param mixed $value Value to assign to the action
     *
     * @throws Exception
     */
    public function apiCall($action, $value)
    {
        switch ($action) {
            case 'setCurrentStep':
                if (!$this->onBoarding->setCurrentStep($value)) {
                    throw new Exception('The current step cannot be saved.');
                }
                break;
            case 'setShutDown':
                if (!$this->onBoarding->setShutDown($value)) {
                    throw new Exception('The shut down status cannot be saved.');
                }
                break;
        }
    }
}
