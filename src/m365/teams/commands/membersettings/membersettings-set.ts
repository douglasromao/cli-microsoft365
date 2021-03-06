import * as chalk from 'chalk';
import { Logger } from '../../../../cli';
import {
  CommandOption
} from '../../../../Command';
import GlobalOptions from '../../../../GlobalOptions';
import request from '../../../../request';
import Utils from '../../../../Utils';
import GraphCommand from '../../../base/GraphCommand';
import commands from '../../commands';

interface CommandArgs {
  options: Options;
}

interface Options extends GlobalOptions {
  allowAddRemoveApps?: string;
  allowCreateUpdateChannels?: string;
  allowCreateUpdateRemoveConnectors?: string;
  allowCreateUpdateRemoveTabs?: string;
  allowDeleteChannels?: string;
  teamId: string;
}

class TeamsMemberSettingsSetCommand extends GraphCommand {
  private static props: string[] = [
    'allowAddRemoveApps',
    'allowCreateUpdateChannels',
    'allowCreateUpdateRemoveConnectors',
    'allowCreateUpdateRemoveTabs',
    'allowDeleteChannels'
  ];

  public get name(): string {
    return `${commands.TEAMS_MEMBERSETTINGS_SET}`;
  }

  public get description(): string {
    return 'Updates member settings of a Microsoft Teams team';
  }

  public getTelemetryProperties(args: CommandArgs): any {
    const telemetryProps: any = super.getTelemetryProperties(args);
    TeamsMemberSettingsSetCommand.props.forEach(p => {
      telemetryProps[p] = (args.options as any)[p];
    });
    return telemetryProps;
  }

  public commandAction(logger: Logger, args: CommandArgs, cb: () => void): void {
    const data: any = {
      memberSettings: {}
    };
    TeamsMemberSettingsSetCommand.props.forEach(p => {
      if (typeof (args.options as any)[p] !== 'undefined') {
        data.memberSettings[p] = (args.options as any)[p] === 'true';
      }
    });

    const requestOptions: any = {
      url: `${this.resource}/v1.0/teams/${encodeURIComponent(args.options.teamId)}`,
      headers: {
        accept: 'application/json;odata.metadata=none'
      },
      data: data,
      responseType: 'json'
    };

    request
      .patch(requestOptions)
      .then((): void => {
        if (this.verbose) {
          logger.logToStderr(chalk.green('DONE'));
        }

        cb();
      }, (err: any) => this.handleRejectedODataJsonPromise(err, logger, cb));
  }

  public options(): CommandOption[] {
    const options: CommandOption[] = [
      {
        option: '-i, --teamId <teamId>',
        description: 'The ID of the Teams team for which to update settings'
      },
      {
        option: '--allowAddRemoveApps [allowAddRemoveApps]',
        description: 'Set to true to allow members to add and remove apps and to false to disallow it'
      },
      {
        option: '--allowCreateUpdateChannels [allowCreateUpdateChannels]',
        description: 'Set to true to allow members to create and update channels and to false to disallow it'
      },
      {
        option: '--allowCreateUpdateRemoveConnectors [allowCreateUpdateRemoveConnectors]',
        description: 'Set to true to allow members to create, update and remove connectors and to false to disallow it'
      },
      {
        option: '--allowCreateUpdateRemoveTabs [allowCreateUpdateRemoveTabs]',
        description: 'Set to true to allow members to create, update and remove tabs and to false to disallow it'
      },
      {
        option: '--allowDeleteChannels [allowDeleteChannels]',
        description: 'Set to true to allow members to create and update channels and to false to disallow it'
      }
    ];

    const parentOptions: CommandOption[] = super.options();
    return options.concat(parentOptions);
  }

  public validate(args: CommandArgs): boolean | string {
    if (!Utils.isValidGuid(args.options.teamId)) {
      return `${args.options.teamId} is not a valid GUID`;
    }

    let isValid: boolean = true;
    let value, property: string = '';
    TeamsMemberSettingsSetCommand.props.every(p => {
      property = p;
      value = (args.options as any)[p];
      isValid = typeof value === 'undefined' ||
        value === 'true' ||
        value === 'false';
      return isValid;
    });
    if (!isValid) {
      return `Value ${value} for option ${property} is not a valid boolean`;
    }

    return true;
  }
}

module.exports = new TeamsMemberSettingsSetCommand();