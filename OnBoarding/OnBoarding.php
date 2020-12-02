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

use Configuration as LegacyConfiguration;
use Module;
use PrestaShopBundle\Service\Routing\Router;
use PrestaShopBundle\Translation\TranslatorComponent as Translator;
use Smarty_Data;

/**
 * OnBoarding main class.
 */
class OnBoarding
{
    /**
     * @var array
     */
    private $configuration;

    /**
     * @var Module
     */
    private $module;

    /**
     * @var Translator
     */
    private $translator;

    /**
     * @var Smarty_Data
     */
    private $smarty;

    /**
     * OnBoarding constructor.
     *
     * @param Translator $translator Twig environment needed to manage the templates
     * @param Smarty_Data $smarty
     * @param Module $module
     * @param Router $router
     */
    public function __construct($translator, $smarty, $module, Router $router)
    {
        $this->translator = $translator;
        $this->smarty = $smarty;
        $this->module = $module;

        $this->loadConfiguration($router);
    }

    /**
     * Show the OnBoarding module content.
     */
    public function showModuleContent()
    {
        $templates = [];
        foreach ($this->configuration['templates'] as $template) {
            $templates[] = [
                'name' => $template,
                'content' => str_replace(["\n", "\r", "\t"], '', $this->getTemplateContent("templates/$template")),
            ];
        }

        echo $this->getTemplateContent('content', [
            'currentStep' => $this->getCurrentStep(),
            'totalSteps' => $this->getTotalSteps(),
            'percent_real' => ($this->getCurrentStep() / $this->getTotalSteps()) * 100,
            'percent_rounded' => round(($this->getCurrentStep() / $this->getTotalSteps()) * 100),
            'isShutDown' => $this->isShutDown(),
            'steps' => $this->configuration['steps'],
            'jsonSteps' => json_encode($this->configuration['steps']),
            'templates' => $templates,
        ]);
    }

    /**
     * Show the OnBoarding content for the nav bar.
     */
    public function showModuleContentForNavBar()
    {
        echo $this->getTemplateContent('navbar', [
            'currentStep' => $this->getCurrentStep(),
            'totalSteps' => $this->getTotalSteps(),
            'percent_real' => ($this->getCurrentStep() / $this->getTotalSteps()) * 100,
            'percent_rounded' => round(($this->getCurrentStep() / $this->getTotalSteps()) * 100),
        ]);
    }

    /**
     * Set the current step.
     *
     * @param int $step Current step ID
     *
     * @return bool Success of the configuration update
     */
    public function setCurrentStep($step)
    {
        return LegacyConfiguration::updateValue('ONBOARDINGV2_CURRENT_STEP', $step);
    }

    /**
     * Set the shut down status.
     *
     * @param bool $status Onboarding shut downed or not
     *
     * @return bool Success of the configuration update
     */
    public function setShutDown($status)
    {
        return LegacyConfiguration::updateValue('ONBOARDINGV2_SHUT_DOWN', $status);
    }

    /**
     * Return true if the OnBoarding is finished.
     *
     * @return bool True if the OnBoarding is finished
     */
    public function isFinished()
    {
        return $this->getCurrentStep() >= $this->getTotalSteps();
    }

    /**
     * Load all the steps with the localized texts.
     *
     * @param Router $router
     */
    private function loadConfiguration(Router $router)
    {
        $configuration = new Configuration($this->translator);
        $configuration = $configuration->getConfiguration($router);

        foreach ($configuration['steps']['groups'] as &$currentGroup) {
            if (isset($currentGroup['title'])) {
                $currentGroup['title'] = $this->getTextFromSettings($currentGroup['title']);
            }
            if (isset($currentGroup['subtitle'])) {
                foreach ($currentGroup['subtitle'] as &$subtitle) {
                    $subtitle = $this->getTextFromSettings($subtitle);
                }
            }
            foreach ($currentGroup['steps'] as &$currentStep) {
                $currentStep['text'] = $this->getTextFromSettings($currentStep['text']);
            }
        }

        $this->configuration = $configuration;
    }

    /**
     * Return a text from step text configuration.
     *
     * @param array $text Step text configuration
     *
     * @return array|mixed|string|null
     */
    private function getTextFromSettings($text)
    {
        if (is_array($text)) {
            switch ($text['type']) {
                case 'template':
                    return $this->getTemplateContent('contents/' . $text['src']);
            }
        }

        return $text;
    }

    /**
     * Echoes a template.
     *
     * @param string $templateName Template name
     */
    public function showTemplate($templateName)
    {
        echo $this->getTemplateContent($templateName);
    }

    /**
     * Return a template.
     *
     * @param string $templateName Template name
     * @param array $additionnalParameters Additionnal parameters to inject on the Twig template
     *
     * @return string
     */
    private function getTemplateContent($templateName, $additionnalParameters = [])
    {
        $this->smarty->assign($additionnalParameters);

        return $this->module->fetch(__DIR__ . '/../views/' . $templateName . '.tpl');
    }

    /**
     * Return the current step.
     *
     * @return int Current step
     */
    private function getCurrentStep()
    {
        return (int) LegacyConfiguration::get('ONBOARDINGV2_CURRENT_STEP');
    }

    /**
     * Return the steps count.
     *
     * @return int Steps count
     */
    private function getTotalSteps()
    {
        $total = 0;

        if (null != $this->configuration) {
            foreach ($this->configuration['steps']['groups'] as &$group) {
                $total += count($group['steps']);
            }
        }

        return $total;
    }

    /**
     * Return the shut down status.
     *
     * @return int
     */
    private function isShutDown()
    {
        return (int) LegacyConfiguration::get('ONBOARDINGV2_SHUT_DOWN');
    }
}
