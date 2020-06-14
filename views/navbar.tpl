{**
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
 *}

<div class="onboarding-navbar bootstrap">
  <div class="row text">
    <div class="col-md-8">
      {l s='Launch your shop!' d='Modules.Welcome.Admin'}
    </div>
    <div class="col-md-4 text-right text-md-right">{$percent_rounded}%</div>
  </div>
  <div class="progress">
    <div class="bar" role="progressbar" style="width:{$percent_real}%;"></div>
  </div>
  <div>
    <button class="btn btn-main btn-sm onboarding-button-resume">{l s='Resume' d='Modules.Welcome.Admin'}</button>
  </div>
  <div>
    <a class="btn -small btn-main btn-sm onboarding-button-stop">{l s='Stop the OnBoarding' d='Modules.Welcome.Admin'}</a>
  </div>
</div>
