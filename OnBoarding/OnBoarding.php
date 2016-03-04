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

use Shudrum\Component\ArrayFinder\ArrayFinder;
use Symfony\Component\Yaml\Yaml;
use Configuration;
use Twig_Environment;

/**
 * OnBoarding main class.
 */
class OnBoarding
{
    /**
     * @var Twig_Environment
     */
    private $twigEnvironment;

    /**
     * @var ArrayFinder
     */
    private $localization;

    /**
     * @var array
     */
    private $steps;

    /**
     * @var array
     */
    private $configuration;

    /**
     * OnBoarding constructor.
     *
     * @param Twig_Environment $twigEnvironment     Twig environment needed to manage the templates
     * @param string           $configurationFolder Configuration folder
     * @param string           $languageIsoCode     Language ISO code
     */
    public function __construct(
        Twig_Environment $twigEnvironment,
        $configurationFolder,
        $languageIsoCode = 'en'
    ) {
        $this->twigEnvironment = $twigEnvironment;

        $this->configuration = Yaml::parse(file_get_contents($configurationFolder.'/configuration.yml'));

        $this->loadSteps($configurationFolder, $languageIsoCode);
    }

    /**
     * Show the OnBoarding module content.
     */
    public function showModuleContent()
    {
        $templates = array();
        foreach ($this->configuration['templates'] as $template) {
            $templates[] = array(
                'name'    => $template,
                'content' => $this->getTemplateContent("templates/$template"),
            );
        }

        echo $this->getTemplateContent('content', array(
            'currentStep' => $this->getCurrentStep(),
            'totalSteps'  => $this->getTotalSteps(),
            'isShutDown'  => $this->isShutDown(),
            'steps'       => $this->steps,
            'jsonSteps'   => json_encode($this->steps),
            'templates'   => $templates,
        ));
    }

    /**
     * Show the OnBoarding content for the nav bar.
     */
    public function showModuleContentForNavBar()
    {
        echo $this->getTemplateContent('navbar', array(
            'currentStep' => $this->getCurrentStep(),
            'totalSteps'  => $this->getTotalSteps(),
        ));
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
        return Configuration::updateValue('ONBOARDINGV2_CURRENT_STEP', $step);
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
        return Configuration::updateValue('ONBOARDINGV2_SHUT_DOWN', $status);
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
     * @param string $configPath      Path where the configuration can be loaded
     * @param string $languageIsoCode Iso code for the localization
     */
    private function loadSteps($configPath, $languageIsoCode)
    {
        $this->localization = Yaml::parse(file_get_contents($configPath.'/localization/'.$languageIsoCode.'.yml'));
        $this->localization = new ArrayFinder($this->localization);

        $steps = Yaml::parse(file_get_contents($configPath.'/steps.yml'));

        foreach ($steps['groups'] as &$currentGroup) {
            $currentGroup['title'] = $this->getTextFromSettings($currentGroup['title']);
            foreach ($currentGroup['steps'] as &$currentStep) {
                $currentStep['title'] = $this->getTextFromSettings($currentStep['title']);
                $currentStep['text'] = $this->getTextFromSettings($currentStep['text']);
            }
        }

        $this->steps = $steps;
    }

    /**
     * Return a text from step text configuration.
     *
     * @param array $text Step text configuration
     *
     * @return string|null Text if it exists
     */
    private function getTextFromSettings($text)
    {
        switch (array_keys($text)[0]) {
            case 'loc':
                return $this->localization[$text['loc']];
            case 'content':
                return $this->getTemplateContent('contents/'.$text['content']);
        }

        return null;
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
     * @param string $templateName          Template name
     * @param array  $additionnalParameters Additionnal parameters to inject on the Twig template
     *
     * @return string Parsed template
     */
    private function getTemplateContent($templateName, $additionnalParameters = array())
    {
        return $this->twigEnvironment->render($templateName.'.twig', array_merge(
            $additionnalParameters,
            $this->localization->get()
        ));
    }

    /**
     * Return the current step.
     *
     * @return int Current step
     */
    private function getCurrentStep()
    {
        return (int)Configuration::get('ONBOARDINGV2_CURRENT_STEP');
    }

    /**
     * Return the steps count.
     *
     * @return int Steps count
     */
    private function getTotalSteps()
    {
        $total = 0;

        if (null != $this->steps) {
            foreach ($this->steps['groups'] as &$group) {
                $total += count($group['steps']);
            }
        }

        return $total;
    }

    /**
     * Return the shut down status.
     *
     * @return bool Shut down status
     */
    private function isShutDown()
    {
        return (int)Configuration::get('ONBOARDINGV2_SHUT_DOWN');
    }
}
